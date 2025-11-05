/**
 * Advanced Logging Utility
 * Provides comprehensive logging with context, timestamps, and error tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  productId?: string;
  categoryId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this.getTimestamp();
    const contextStr = context ? ` | ${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private getColorForLevel(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[34m', // Blue
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      success: '\x1b[32m', // Green
    };
    return colors[level] || '\x1b[0m';
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: any) {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      error: error ? {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      } : undefined,
      stack: error?.stack,
    };

    this.addLog(entry);

    if (this.isDevelopment) {
      const color = this.getColorForLevel(level);
      const reset = '\x1b[0m';
      const formattedMessage = this.formatMessage(level, message, context);

      console.log(`${color}${formattedMessage}${reset}`);

      if (error) {
        console.error(`${color}Error Details:${reset}`, {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack,
        });
      }
    }
  }

  // Public logging methods
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    this.log('error', message, context, error);
  }

  success(message: string, context?: LogContext) {
    this.log('success', message, context);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get logs summary
  getSummary(): { total: number; byLevel: Record<LogLevel, number> } {
    const summary = {
      total: this.logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        success: 0,
      } as Record<LogLevel, number>,
    };

    this.logs.forEach(log => {
      summary.byLevel[log.level]++;
    });

    return summary;
  }
}

// Create singleton instance
export const logger = new Logger();

// Specialized loggers for different modules
export const productLogger = {
  // List operations
  loadList: (context?: LogContext) =>
    logger.info('Loading products list', { component: 'ProductsList', action: 'load', ...context }),

  loadListSuccess: (count: number, context?: LogContext) =>
    logger.success(`Products loaded successfully: ${count} items`, { component: 'ProductsList', action: 'load_success', count, ...context }),

  loadListError: (error: any, context?: LogContext) =>
    logger.error('Failed to load products list', error, { component: 'ProductsList', action: 'load_error', ...context }),

  // Search operations
  search: (query: string, context?: LogContext) =>
    logger.debug(`Searching products: "${query}"`, { component: 'ProductsList', action: 'search', query, ...context }),

  searchResults: (query: string, count: number, context?: LogContext) =>
    logger.info(`Search results for "${query}": ${count} items`, { component: 'ProductsList', action: 'search_results', query, count, ...context }),

  // Filter operations
  applyFilters: (filters: any, context?: LogContext) =>
    logger.info('Applying filters', { component: 'ProductsList', action: 'apply_filters', filters, ...context }),

  clearFilters: (context?: LogContext) =>
    logger.info('Clearing all filters', { component: 'ProductsList', action: 'clear_filters', ...context }),

  // Sort operations
  sort: (sortBy: string, order: string, context?: LogContext) =>
    logger.debug(`Sorting products by ${sortBy} (${order})`, { component: 'ProductsList', action: 'sort', sortBy, order, ...context }),

  // Create operations
  createStart: (data: any, context?: LogContext) =>
    logger.info('Creating new product', { component: 'AddProduct', action: 'create_start', data, ...context }),

  createSuccess: (productId: string, context?: LogContext) =>
    logger.success(`Product created successfully: ${productId}`, { component: 'AddProduct', action: 'create_success', productId, ...context }),

  createError: (error: any, context?: LogContext) =>
    logger.error('Failed to create product', error, { component: 'AddProduct', action: 'create_error', ...context }),

  // Update operations
  updateStart: (productId: string, data: any, context?: LogContext) =>
    logger.info(`Updating product: ${productId}`, { component: 'EditProduct', action: 'update_start', productId, data, ...context }),

  updateSuccess: (productId: string, context?: LogContext) =>
    logger.success(`Product updated successfully: ${productId}`, { component: 'EditProduct', action: 'update_success', productId, ...context }),

  updateError: (productId: string, error: any, context?: LogContext) =>
    logger.error(`Failed to update product: ${productId}`, error, { component: 'EditProduct', action: 'update_error', productId, ...context }),

  // Delete operations
  deleteStart: (productId: string, context?: LogContext) =>
    logger.warn(`Deleting product: ${productId}`, { component: 'ProductsList', action: 'delete_start', productId, ...context }),

  deleteSuccess: (productId: string, context?: LogContext) =>
    logger.success(`Product deleted successfully: ${productId}`, { component: 'ProductsList', action: 'delete_success', productId, ...context }),

  deleteError: (productId: string, error: any, context?: LogContext) =>
    logger.error(`Failed to delete product: ${productId}`, error, { component: 'ProductsList', action: 'delete_error', productId, ...context }),

  // Image operations
  imageUploadStart: (count: number, context?: LogContext) =>
    logger.info(`Uploading ${count} images`, { component: 'AddProduct', action: 'image_upload_start', count, ...context }),

  imageUploadProgress: (index: number, total: number, percentage: number, context?: LogContext) =>
    logger.debug(`Image upload progress: ${index + 1}/${total} (${percentage}%)`, { component: 'AddProduct', action: 'image_upload_progress', index, total, percentage, ...context }),

  imageUploadSuccess: (count: number, urls: string[], context?: LogContext) =>
    logger.success(`Images uploaded successfully: ${count} items`, { component: 'AddProduct', action: 'image_upload_success', count, urls, ...context }),

  imageUploadError: (error: any, context?: LogContext) =>
    logger.error('Image upload failed', error, { component: 'AddProduct', action: 'image_upload_error', ...context }),

  // Image validation
  imageValidationStart: (count: number, context?: LogContext) =>
    logger.debug(`Validating ${count} images`, { component: 'AddProduct', action: 'image_validation_start', count, ...context }),

  imageValidationSuccess: (count: number, context?: LogContext) =>
    logger.success(`Image validation passed: ${count} images`, { component: 'AddProduct', action: 'image_validation_success', count, ...context }),

  imageValidationError: (errors: string[], context?: LogContext) =>
    logger.error('Image validation failed', { errors }, { component: 'AddProduct', action: 'image_validation_error', errors, ...context }),

  // AI operations
  aiGenerateStart: (imageUri: string, context?: LogContext) =>
    logger.info('Starting AI content generation', { component: 'AddProduct', action: 'ai_generate_start', imageUri, ...context }),

  aiGenerateSuccess: (content: any, context?: LogContext) =>
    logger.success('AI content generated successfully', { component: 'AddProduct', action: 'ai_generate_success', content, ...context }),

  aiGenerateError: (error: any, context?: LogContext) =>
    logger.error('AI content generation failed', error, { component: 'AddProduct', action: 'ai_generate_error', ...context }),

  // Load single product
  loadProduct: (productId: string, context?: LogContext) =>
    logger.info(`Loading product: ${productId}`, { component: 'ProductDetails', action: 'load_product', productId, ...context }),

  loadProductSuccess: (productId: string, product: any, context?: LogContext) =>
    logger.success(`Product loaded successfully: ${productId}`, { component: 'ProductDetails', action: 'load_product_success', productId, product, ...context }),

  loadProductError: (productId: string, error: any, context?: LogContext) =>
    logger.error(`Failed to load product: ${productId}`, error, { component: 'ProductDetails', action: 'load_product_error', productId, ...context }),

  // Pagination
  loadMore: (page: number, context?: LogContext) =>
    logger.debug(`Loading more products: page ${page}`, { component: 'ProductsList', action: 'load_more', page, ...context }),

  loadMoreSuccess: (page: number, count: number, context?: LogContext) =>
    logger.success(`Loaded more products: page ${page}, ${count} items`, { component: 'ProductsList', action: 'load_more_success', page, count, ...context }),

  loadMoreError: (page: number, error: any, context?: LogContext) =>
    logger.error(`Failed to load more products: page ${page}`, error, { component: 'ProductsList', action: 'load_more_error', page, ...context }),

  // Refresh
  refresh: (context?: LogContext) =>
    logger.info('Refreshing products list', { component: 'ProductsList', action: 'refresh', ...context }),

  refreshSuccess: (count: number, context?: LogContext) =>
    logger.success(`Products refreshed: ${count} items`, { component: 'ProductsList', action: 'refresh_success', count, ...context }),

  refreshError: (error: any, context?: LogContext) =>
    logger.error('Failed to refresh products', error, { component: 'ProductsList', action: 'refresh_error', ...context }),
};

// Category logger
export const categoryLogger = {
  loadList: (context?: LogContext) =>
    logger.info('Loading categories list', { component: 'CategoriesList', action: 'load', ...context }),

  loadListSuccess: (count: number, context?: LogContext) =>
    logger.success(`Categories loaded successfully: ${count} items`, { component: 'CategoriesList', action: 'load_success', count, ...context }),

  loadListError: (error: any, context?: LogContext) =>
    logger.error('Failed to load categories list', error, { component: 'CategoriesList', action: 'load_error', ...context }),
};

// API logger
export const apiLogger = {
  request: (method: string, url: string, data?: any, context?: LogContext) =>
    logger.debug(`API Request: ${method} ${url}`, { component: 'API', action: 'request', method, url, data, ...context }),

  response: (method: string, url: string, status: number, data?: any, context?: LogContext) =>
    logger.info(`API Response: ${method} ${url} (${status})`, { component: 'API', action: 'response', method, url, status, data, ...context }),

  error: (method: string, url: string, error: any, context?: LogContext) =>
    logger.error(`API Error: ${method} ${url}`, error, { component: 'API', action: 'error', method, url, ...context }),
};

export default logger;
