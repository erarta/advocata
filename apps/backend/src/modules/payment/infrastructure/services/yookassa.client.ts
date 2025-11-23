import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  IYooKassaClient,
  YooKassaPaymentResponse,
  YooKassaRefundResponse,
  CreatePaymentRequest,
  CreateRefundRequest,
} from './yookassa-client.interface';

/**
 * YooKassa Client Implementation
 *
 * Implements integration with YooKassa payment gateway using REST API.
 * Documentation: https://yookassa.ru/developers/api
 */
@Injectable()
export class YooKassaClient implements IYooKassaClient {
  private readonly httpClient: AxiosInstance;
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly apiUrl = 'https://api.yookassa.ru/v3';

  constructor(private readonly configService: ConfigService) {
    // Get credentials from environment
    this.shopId = this.configService.get<string>('YOOKASSA_SHOP_ID')!;
    this.secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY')!;

    if (!this.shopId || !this.secretKey) {
      throw new Error(
        'YooKassa credentials not configured. Set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY',
      );
    }

    // Create HTTP client with Basic Auth
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      auth: {
        username: this.shopId,
        password: this.secretKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new payment
   */
  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<YooKassaPaymentResponse> {
    try {
      // Generate idempotency key for safe retries
      const idempotencyKey = uuidv4();

      const response = await this.httpClient.post<YooKassaPaymentResponse>(
        '/payments',
        {
          amount: {
            value: (request.amount / 100).toFixed(2), // Convert kopecks to rubles
            currency: request.currency,
          },
          description: request.description,
          metadata: request.metadata,
          capture: request.capture !== false, // Auto-capture by default
          confirmation: {
            type: 'redirect',
            return_url: request.returnUrl || process.env.PAYMENT_RETURN_URL,
          },
        },
        {
          headers: {
            'Idempotence-Key': idempotencyKey,
          },
        },
      );

      // Extract confirmation URL
      const confirmationUrl =
        (response.data as any).confirmation?.confirmation_url ||
        (response.data as any).confirmation?.confirmationUrl;

      return {
        ...response.data,
        confirmationUrl,
      };
    } catch (error) {
      this.handleYooKassaError(error, 'createPayment');
      throw error;
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    try {
      const response = await this.httpClient.get<YooKassaPaymentResponse>(
        `/payments/${paymentId}`,
      );

      return response.data;
    } catch (error) {
      this.handleYooKassaError(error, 'getPayment');
      throw error;
    }
  }

  /**
   * Capture payment (for two-step payments)
   */
  async capturePayment(
    paymentId: string,
    amount?: number,
  ): Promise<YooKassaPaymentResponse> {
    try {
      const idempotencyKey = uuidv4();

      const payload: any = {};

      if (amount) {
        payload.amount = {
          value: (amount / 100).toFixed(2),
          currency: 'RUB',
        };
      }

      const response = await this.httpClient.post<YooKassaPaymentResponse>(
        `/payments/${paymentId}/capture`,
        payload,
        {
          headers: {
            'Idempotence-Key': idempotencyKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.handleYooKassaError(error, 'capturePayment');
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    try {
      const idempotencyKey = uuidv4();

      const response = await this.httpClient.post<YooKassaPaymentResponse>(
        `/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            'Idempotence-Key': idempotencyKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.handleYooKassaError(error, 'cancelPayment');
      throw error;
    }
  }

  /**
   * Create refund
   */
  async createRefund(
    request: CreateRefundRequest,
  ): Promise<YooKassaRefundResponse> {
    try {
      const idempotencyKey = uuidv4();

      const response = await this.httpClient.post<YooKassaRefundResponse>(
        '/refunds',
        {
          payment_id: request.paymentId,
          amount: {
            value: (request.amount / 100).toFixed(2),
            currency: 'RUB',
          },
          description: request.description,
        },
        {
          headers: {
            'Idempotence-Key': idempotencyKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.handleYooKassaError(error, 'createRefund');
      throw error;
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<YooKassaRefundResponse> {
    try {
      const response = await this.httpClient.get<YooKassaRefundResponse>(
        `/refunds/${refundId}`,
      );

      return response.data;
    } catch (error) {
      this.handleYooKassaError(error, 'getRefund');
      throw error;
    }
  }

  /**
   * Handle YooKassa API errors
   */
  private handleYooKassaError(error: any, operation: string): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.response?.data?.description ||
        error.response?.data?.message ||
        error.message;

      console.error(`YooKassa ${operation} error:`, {
        status,
        message,
        data: error.response?.data,
      });

      throw new HttpException(
        {
          statusCode: status,
          message: `YooKassa API error: ${message}`,
          error: 'YooKassa Error',
          operation,
        },
        status,
      );
    }

    console.error(`YooKassa ${operation} unexpected error:`, error);

    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unexpected error communicating with YooKassa',
        error: 'Internal Server Error',
        operation,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
