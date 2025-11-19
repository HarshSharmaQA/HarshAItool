export type SecurityRuleContext = {
  message?: string;
  path?: string;
  operation?: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

// A custom error class to provide more context about Firestore permission errors.
// This is used in conjunction with the error-emitter and FirebaseErrorListener
// to show detailed error information in the Next.js development overlay.
export class FirestorePermissionError extends Error {
  
  public context: SecurityRuleContext;
  
  constructor(context: SecurityRuleContext) {
    const defaultMessage = "Firestore Security Rules Error: Missing or insufficient permissions.";
    
    // Construct a detailed message for the developer
    const messageLines = [
      context.message || defaultMessage,
      "The following request was denied by Firestore Security Rules:",
      ""
    ];

    const details: any = {};
    
    if (context.path) details.path = context.path;
    if (context.operation) details.operation = context.operation;
    if (context.requestResourceData) details.resource = context.requestResourceData;

    messageLines.push(JSON.stringify(details, null, 2));

    super(messageLines.join('\n'));
    
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is to make the error object serializable and readable in the overlay
    this.stack = '';
  }
}
