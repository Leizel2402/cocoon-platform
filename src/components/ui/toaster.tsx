import { useToast } from "../../hooks/use-toast";
import { Toast, ToastClose, ToastProvider, ToastViewport } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  // Function to determine toast variant based on title and description
  const getToastVariant = (title?: React.ReactNode, description?: React.ReactNode) => {
    const titleStr = typeof title === 'string' ? title : '';
    const descStr = typeof description === 'string' ? description : '';
    const titleLower = titleStr.toLowerCase();
    const descLower = descStr.toLowerCase();
    
    if (titleLower.includes('error') || titleLower.includes('failed') || 
        descLower.includes('error') || descLower.includes('failed')) {
      return 'error';
    }
    
    if (titleLower.includes('success') || titleLower.includes('saved') || 
        titleLower.includes('created') || titleLower.includes('updated')) {
      return 'success';
    }
    if (titleLower.includes('deleted') || titleLower.includes('removed') ) {
  return 'deleted';
}
    if (titleLower.includes('warning') || titleLower.includes('caution')) {
      return 'warning';
    }
    
    if (titleLower.includes('info') || titleLower.includes('applied') || 
        titleLower.includes('filter')) {
      return 'info';
    }
    
    return 'default';
  };

  // Function to get the appropriate icon for each variant
  const getToastIcon = (variant: string) => {
    switch (variant) {
      case 'success':
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
        );
        case 'deleted':
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-600 bg-red-100 rounded-lg">
           <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="red" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
            <span className="sr-only">Check icon</span>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
            </svg>
            <span className="sr-only">Error icon</span>
          </div>
        );
      case 'warning':
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
            </svg>
            <span className="sr-only">Warning icon</span>
          </div>
        );
      case 'info':
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
            </svg>
            <span className="sr-only">Info icon</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-gray-500 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
            </svg>
            <span className="sr-only">Info icon</span>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = getToastVariant(title, description);
        const icon = getToastIcon(variant);
        
        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Icon */}
            {icon}
            
            {/* Content */}
            <div className="ms-3 text-sm font-normal flex items-center">
              {title && <div>{title}</div>}
              {/* {description && <div>{description}</div>} */}
            </div>
            
            {/* Close button */}
            <ToastClose className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8">
              <span className="sr-only">Close</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </ToastClose>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
