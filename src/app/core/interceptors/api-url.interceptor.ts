import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  // Only intercept relative API requests (not full URLs)
  if (req.url.startsWith('/api/')) {
    const apiReq = req.clone({
      url: `${environment.backendUrl}${req.url}`
    });
    return next(apiReq);
  }
  
  return next(req);
};