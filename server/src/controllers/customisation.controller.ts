import { Response, NextFunction } from 'express';
import { CustomisationService } from '../services/customisation.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CustomisationDocument } from '../repositories/customisation.repository';

// Internal team comments are for admins only, so they are removed from anything a customer receives
const forViewer = <T extends Partial<CustomisationDocument>>(request: T, isAdmin: boolean): T => {
  if (isAdmin) return request;
  const { comments: _internalComments, ...visible } = request;
  return visible as T;
};

// Fields an admin may correct on a request; the optional ones can be cleared with an empty value
const ADMIN_EDITABLE_FIELDS = [
  'customerName', 'phone', 'email', 'whatsappNumber', 'address',
  'fabricPref', 'colorPref', 'budgetRange', 'deliveryDate', 'notes',
] as const;
const CLEARABLE_FIELDS = new Set<string>([
  'whatsappNumber', 'address', 'fabricPref', 'colorPref', 'budgetRange', 'deliveryDate', 'notes',
]);

export class CustomisationController {
  private customisationService = new CustomisationService();

  /**
   * Submits a new tailoring design request.
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user ? req.user.uid : null;
      const {
        customerName,
        phone,
        email,
        whatsappNumber,
        category,
        occasion,
        productId,
        productSku,
        fabricPref,
        colorPref,
        budgetRange,
        address,
        deliveryDate,
        notes,
      } = req.body;

      const files = req.files as Express.Multer.File[] || [];
      const localImagePaths = files.map((file) => file.path);

      const request = await this.customisationService.createRequest(
        {
          userId,
          customerName: customerName || req.user?.name || 'Client',
          phone,
          email: email || req.user?.email || '',
          whatsappNumber: whatsappNumber || null,
          category,
          occasion,
          productId: productId || null,
          productSku: productSku || null,
          fabricPref: fabricPref || null,
          colorPref: colorPref || null,
          budgetRange: budgetRange || null,
          address: address || null,
          deliveryDate: deliveryDate || null,
          notes: notes || null,
        },
        localImagePaths
      );

      sendSuccess(res, { request: forViewer(request, req.user?.role === 'ADMIN') }, 'Tailoring request submitted successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Modifies tailoring fields or measurement logs of an existing custom request.
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { notes, fabricPref, colorPref, budgetRange, deliveryDate } = req.body;
      const isAdmin = req.user!.role === 'ADMIN';

      // Verify request exists and validate ownership credentials
      const request = await this.customisationService.getRequestById(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Request not found', errors: ['Not Found'] });
        return;
      }

      if (request.userId !== req.user!.uid && !isAdmin) {
        res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
        return;
      }

      let changes: Partial<CustomisationDocument>;
      if (isAdmin) {
        // Admins can correct any detail (including contact info) and clear optional ones
        const edits: Record<string, string | null> = {};
        for (const field of ADMIN_EDITABLE_FIELDS) {
          const value = req.body[field];
          if (value === undefined) continue;
          const text = typeof value === 'string' ? value.trim() : value;
          edits[field] = text === '' && CLEARABLE_FIELDS.has(field) ? null : text;
        }
        changes = edits as Partial<CustomisationDocument>;
      } else {
        // Customers may only add to their own notes and preferences
        changes = {
          ...(notes && { notes }),
          ...(fabricPref && { fabricPref }),
          ...(colorPref && { colorPref }),
          ...(budgetRange && { budgetRange }),
          ...(deliveryDate && { deliveryDate }),
        };
      }

      const updated = await this.customisationService.updateRequest(id, changes);

      sendSuccess(res, { request: updated && forViewer(updated, isAdmin) }, 'Custom request updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Appends an administrative note or stylist consultation logs (Admin only).
   */
  addNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { text } = req.body;
      const author = req.user!.name || req.user!.email || 'Stylist';

      const request = await this.customisationService.addAdminNote(id, author, text);
      sendSuccess(res, { request }, 'Admin note appended successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Adds an internal team comment, e.g. after contacting the customer (Admin only).
   */
  addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { text } = req.body;
      // The name defaults to "Client" when a profile has none, which is useless in a team log
      const name = req.user!.name && req.user!.name !== 'Client' ? req.user!.name : '';
      const author = name || req.user!.email || 'Admin';

      const request = await this.customisationService.addComment(id, author, text);
      sendSuccess(res, { request }, 'Comment added.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Transitions the status state of the request (Admin only).
   */
  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { status } = req.body;

      const request = await this.customisationService.updateStatus(id, status);
      sendSuccess(res, { request }, 'Status updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetches details of a specific request.
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const request = await this.customisationService.getRequestById(id);

      if (!request) {
        res.status(404).json({ success: false, message: 'Request not found', errors: ['Not Found'] });
        return;
      }

      // Enforce customisation request ownership checks
      if (request.userId !== req.user!.uid && req.user!.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Access denied.', errors: ['Forbidden'] });
        return;
      }

      sendSuccess(res, { request: forViewer(request, req.user!.role === 'ADMIN') }, 'Custom request details retrieved.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lists request dossiers. Clients can only see their own requests; admins can see all database items.
   */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status } = req.query;

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const filters: any = {
        ...(status && { status }),
      };

      // Restrict clients to only viewing their own tailoring histories
      if (req.user!.role !== 'ADMIN') {
        filters.userId = req.user!.uid;
      }

      const result = await this.customisationService.listRequests(filters, pageNum, limitNum);
      const isAdmin = req.user!.role === 'ADMIN';
      sendSuccess(
        res,
        { ...result, items: result.items.map((item) => forViewer(item, isAdmin)) },
        'Customisation requests retrieved.',
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

export default CustomisationController;
