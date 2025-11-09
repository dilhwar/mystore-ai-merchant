import { apiGet, apiPut } from './api';

// ========================================
// TYPES
// ========================================

export interface PaymentMethod {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  instructions?: string;
  instructionsAr?: string;
  type: string;
  enabled: boolean;
  requireReceipt?: boolean;
  // Bank Transfer specific fields
  bankName?: string;
  bankNameAr?: string;
  accountHolderName?: string;
  accountHolderNameAr?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  branch?: string;
  branchAr?: string;
  // E-Wallet specific fields
  walletProvider?: string;
  walletProviderAr?: string;
  walletNumber?: string;
  walletAccountName?: string;
  walletAccountNameAr?: string;
  qrCodeUrl?: string;
  paymentLink?: string;
  // Built-in identifier
  isBuiltIn?: boolean;
}

export interface CreatePaymentMethodData {
  type: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  instructions?: string;
  instructionsAr?: string;
  enabled?: boolean;
  requireReceipt?: boolean;
  feeAmount?: number;
  // Bank Transfer fields
  bankName?: string;
  bankNameAr?: string;
  accountHolderName?: string;
  accountHolderNameAr?: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  branch?: string;
  branchAr?: string;
  // E-Wallet fields
  walletProvider?: string;
  walletProviderAr?: string;
  walletNumber?: string;
  walletAccountName?: string;
  walletAccountNameAr?: string;
  qrCodeUrl?: string;
  paymentLink?: string;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
  // Additional update-specific fields if needed
}

// ========================================
// PAYMENT METHODS (stored in StoreSettings)
// ========================================

/**
 * Get all payment methods from StoreSettings
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  try {
    const response = await apiGet<{ success: boolean; data: any }>('/settings');

    const paymentMethods = response.data.data?.paymentMethods;

    if (!paymentMethods) {
      return [];
    }

    // Parse if it's a string
    const methods = typeof paymentMethods === 'string'
      ? JSON.parse(paymentMethods)
      : paymentMethods;

    return Array.isArray(methods) ? methods : [];
  } catch (error: any) {
    console.error('Get payment methods error:', error.message);
    throw error;
  }
};

/**
 * Get a single payment method by ID
 */
export const getPaymentMethod = async (methodId: string): Promise<PaymentMethod> => {
  try {
    const methods = await getPaymentMethods();
    const method = methods.find(m => m.id === methodId);

    if (!method) {
      throw new Error('Payment method not found');
    }

    return method;
  } catch (error: any) {
    console.error('Get payment method error:', error.message);
    throw error;
  }
};

/**
 * Create a new payment method
 */
export const createPaymentMethod = async (
  data: CreatePaymentMethodData
): Promise<PaymentMethod> => {
  try {
    // Get current payment methods
    const currentMethods = await getPaymentMethods();

    // Create new method with unique ID
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: data.type,
      name: data.name || '',
      nameAr: data.nameAr || '',
      description: data.description || '',
      descriptionAr: data.descriptionAr || '',
      instructions: data.instructions || '',
      instructionsAr: data.instructionsAr || '',
      enabled: data.enabled !== undefined ? data.enabled : true,
      requireReceipt: data.requireReceipt || false,
      // Bank Transfer fields
      bankName: data.bankName,
      bankNameAr: data.bankNameAr,
      accountHolderName: data.accountHolderName,
      accountHolderNameAr: data.accountHolderNameAr,
      accountNumber: data.accountNumber,
      iban: data.iban,
      swiftCode: data.swiftCode,
      branch: data.branch,
      branchAr: data.branchAr,
      // E-Wallet fields
      walletProvider: data.walletProvider,
      walletProviderAr: data.walletProviderAr,
      walletNumber: data.walletNumber,
      walletAccountName: data.walletAccountName,
      walletAccountNameAr: data.walletAccountNameAr,
      qrCodeUrl: data.qrCodeUrl,
      paymentLink: data.paymentLink,
    };

    // Add to methods array
    const updatedMethods = [...currentMethods, newMethod];

    // Save to database
    await apiPut('/settings', {
      paymentMethods: updatedMethods
    });

    return newMethod;
  } catch (error: any) {
    console.error('Create payment method error:', error.message);
    throw error;
  }
};

/**
 * Update a payment method
 */
export const updatePaymentMethod = async (
  methodId: string,
  data: UpdatePaymentMethodData
): Promise<void> => {
  try {
    // Get current payment methods
    const currentMethods = await getPaymentMethods();

    // Update the specific method
    const updatedMethods = currentMethods.map(m =>
      m.id === methodId
        ? {
            ...m,
            name: data.name !== undefined ? data.name : m.name,
            nameAr: data.nameAr !== undefined ? data.nameAr : m.nameAr,
            description: data.description !== undefined ? data.description : m.description,
            descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr : m.descriptionAr,
            instructions: data.instructions !== undefined ? data.instructions : m.instructions,
            instructionsAr: data.instructionsAr !== undefined ? data.instructionsAr : m.instructionsAr,
            enabled: data.enabled !== undefined ? data.enabled : m.enabled,
            requireReceipt: data.requireReceipt !== undefined ? data.requireReceipt : m.requireReceipt,
            // Bank Transfer fields
            bankName: data.bankName !== undefined ? data.bankName : m.bankName,
            bankNameAr: data.bankNameAr !== undefined ? data.bankNameAr : m.bankNameAr,
            accountHolderName: data.accountHolderName !== undefined ? data.accountHolderName : m.accountHolderName,
            accountHolderNameAr: data.accountHolderNameAr !== undefined ? data.accountHolderNameAr : m.accountHolderNameAr,
            accountNumber: data.accountNumber !== undefined ? data.accountNumber : m.accountNumber,
            iban: data.iban !== undefined ? data.iban : m.iban,
            swiftCode: data.swiftCode !== undefined ? data.swiftCode : m.swiftCode,
            branch: data.branch !== undefined ? data.branch : m.branch,
            branchAr: data.branchAr !== undefined ? data.branchAr : m.branchAr,
            // E-Wallet fields
            walletProvider: data.walletProvider !== undefined ? data.walletProvider : m.walletProvider,
            walletProviderAr: data.walletProviderAr !== undefined ? data.walletProviderAr : m.walletProviderAr,
            walletNumber: data.walletNumber !== undefined ? data.walletNumber : m.walletNumber,
            walletAccountName: data.walletAccountName !== undefined ? data.walletAccountName : m.walletAccountName,
            walletAccountNameAr: data.walletAccountNameAr !== undefined ? data.walletAccountNameAr : m.walletAccountNameAr,
            qrCodeUrl: data.qrCodeUrl !== undefined ? data.qrCodeUrl : m.qrCodeUrl,
            paymentLink: data.paymentLink !== undefined ? data.paymentLink : m.paymentLink,
          }
        : m
    );

    // Save to database
    await apiPut('/settings', {
      paymentMethods: updatedMethods
    });
  } catch (error: any) {
    console.error('Update payment method error:', error.message);
    throw error;
  }
};

/**
 * Toggle payment method enabled/disabled status
 */
export const togglePaymentMethod = async (methodId: string, enabled: boolean): Promise<void> => {
  try {
    await updatePaymentMethod(methodId, { enabled });
  } catch (error: any) {
    console.error('Toggle payment method error:', error.message);
    throw error;
  }
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  try {
    // Get current payment methods
    const currentMethods = await getPaymentMethods();

    // Filter out the deleted method
    const updatedMethods = currentMethods.filter(m => m.id !== methodId);

    // Save to database
    await apiPut('/settings', {
      paymentMethods: updatedMethods
    });
  } catch (error: any) {
    console.error('Delete payment method error:', error.message);
    throw error;
  }
};
