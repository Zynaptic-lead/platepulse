import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initialize Paystack payment' })
  async initializePayment(@Request() req, @Param('orderId') orderId: string) {
    return this.paystackService.initializePayment(req.user.id, orderId);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify Paystack payment' })
  async verifyPayment(@Query('reference') reference: string) {
    return this.paystackService.verifyPayment(reference);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  async webhook(@Headers() headers, @Body() body: any) {
    // Verify webhook signature (optional - add signature verification)
    return this.paystackService.handleWebhook(body);
  }

  @Post('refund/:paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(@Param('paymentId') paymentId: string, @Body('reason') reason?: string) {
    return this.paystackService.refundPayment(paymentId, reason);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by order ID' })
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paystackService.getPaymentByOrder(orderId);
  }
}