import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Order, OrderStatus, PaymentStatus as OrderPaymentStatus } from '../../modules/orders/entities/order.entity';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY') || '';
    
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
    }
  }

  async initializePayment(customerId: string, orderId: string) {
    // Get order
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customerId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    // Get customer details
    const customer = await this.userRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Initialize Paystack transaction
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: customer.email,
          amount: Math.round(Number(order.total) * 100), // Convert to kobo
          reference: `PLATE-${order.orderNumber}-${Date.now()}`,
          callback_url: this.configService.get('PAYSTACK_CALLBACK_URL'),
          metadata: {
            orderId: order.id,
            customerId: customerId,
            orderNumber: order.orderNumber,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { data } = response.data;

      // Create payment record
      const payment = this.paymentRepository.create({
        orderId: order.id,
        customerId,
        amount: order.total,
        currency: 'NGN',
        method: PaymentMethod.CARD,
        status: PaymentStatus.PENDING,
        paystackReference: data.reference,
        paystackAccessCode: data.access_code,
        paystackAuthorizationUrl: data.authorization_url,
        customerEmail: customer.email,
      });

      await this.paymentRepository.save(payment);

      return {
        success: true,
        authorizationUrl: data.authorization_url,
        reference: data.reference,
        accessCode: data.access_code,
      };
    } catch (error) {
      throw new BadRequestException(
        `Payment initialization failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      const { data } = response.data;

      if (data.status === 'success') {
        // Find payment record
        const payment = await this.paymentRepository.findOne({
          where: { paystackReference: reference },
        });

        if (payment && payment.status !== PaymentStatus.SUCCESS) {
          payment.status = PaymentStatus.SUCCESS;
          payment.transactionId = data.id;
          payment.paidAt = new Date();
          await this.paymentRepository.save(payment);

          // Update order
          await this.orderRepository.update(payment.orderId, {
            paymentStatus: OrderPaymentStatus.PAID,
            status: OrderStatus.CONFIRMED,
          });
        }

        return {
          success: true,
          message: 'Payment verified successfully',
          payment: data,
        };
      }

      return {
        success: false,
        message: 'Payment verification failed',
        status: data.status,
      };
    } catch (error) {
      throw new BadRequestException(
        `Verification failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async handleWebhook(payload: any) {
    const { event, data } = payload;

    switch (event) {
      case 'charge.success':
        await this.handleChargeSuccess(data);
        break;
      case 'charge.failed':
        await this.handleChargeFailed(data);
        break;
      case 'refund.processed':
        await this.handleRefundProcessed(data);
        break;
    }

    return { received: true };
  }

  async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/refund`,
        {
          transaction: payment.transactionId,
          amount: Math.round(Number(payment.amount) * 100),
          reason: reason || 'Customer request',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        payment.status = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();
        await this.paymentRepository.save(payment);

        // Update order
        await this.orderRepository.update(payment.orderId, {
          paymentStatus: OrderPaymentStatus.REFUNDED,
          status: OrderStatus.CANCELLED,
        });

        return { success: true, message: 'Refund processed successfully' };
      }

      return { success: false, message: 'Refund failed' };
    } catch (error) {
      throw new BadRequestException(
        `Refund failed: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getPaymentByOrder(orderId: string) {
    return await this.paymentRepository.findOne({
      where: { orderId },
    });
  }

  private async handleChargeSuccess(data: any) {
    const payment = await this.paymentRepository.findOne({
      where: { paystackReference: data.reference },
    });

    if (payment && payment.status !== PaymentStatus.SUCCESS) {
      payment.status = PaymentStatus.SUCCESS;
      payment.transactionId = data.id;
      payment.paidAt = new Date();
      await this.paymentRepository.save(payment);

      await this.orderRepository.update(payment.orderId, {
        paymentStatus: OrderPaymentStatus.PAID,
        status: OrderStatus.CONFIRMED,
      });
    }
  }

  private async handleChargeFailed(data: any) {
    const payment = await this.paymentRepository.findOne({
      where: { paystackReference: data.reference },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = data.gateway_response;
      await this.paymentRepository.save(payment);
    }
  }

  private async handleRefundProcessed(data: any) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: data.transaction.id.toString() },
    });

    if (payment) {
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      await this.paymentRepository.save(payment);
    }
  }
}