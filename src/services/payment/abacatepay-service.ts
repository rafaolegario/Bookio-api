interface CreateBillingParams {
  amount: number
  description: string
  customerId: string
  customerName: string
  customerEmail: string
  dueDate: Date
}

interface BillingResponse {
  id: string
  url: string
  status: string
}

export class AbacatepayService {
  private apiKey: string
  private baseUrl = 'https://api.abacatepay.com/v1'

  constructor() {
    const apiKey = process.env.ABACATEPAY_API_KEY

    if (!apiKey) {
      throw new Error('ABACATEPAY_API_KEY is not defined in environment variables')
    }

    this.apiKey = apiKey
  }

  async createBilling({
    amount,
    description,
    customerId,
    customerName,
    customerEmail,
    dueDate,
  }: CreateBillingParams): Promise<BillingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          frequency: 'one-time',
          methods: ['PIX'],
          products: [
            {
              externalId: customerId,
              name: description,
              description: description,
              quantity: 1,
              price: Math.round(amount * 100), // Converte para centavos
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Abacatepay API Error: ${JSON.stringify(error)}`)
      }

      const data = await response.json()

      return {
        id: data.id,
        url: data.url,
        status: data.status,
      }
    } catch (error) {
      console.error('Error creating billing:', error)
      throw new Error(
        `Failed to create billing: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getBillingStatus(billingId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/bill/${billingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get billing status: ${response.statusText}`)
      }

      const data = await response.json()
      return data.status
    } catch (error) {
      console.error('Error getting billing status:', error)
      throw error
    }
  }

  async cancelBilling(billingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bill/${billingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to cancel billing: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error canceling billing:', error)
      throw error
    }
  }
}
