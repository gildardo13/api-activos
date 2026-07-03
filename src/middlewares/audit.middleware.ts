import { RequestContext } from 'src/common/context/request-context';

const notTrackedAttributes = [
  'createdAt',
  'updatedAt',
  'created_at',
  'updated_at',
]; // campos de todos los modelos que no se deben rastrear

export function auditMiddleware(prisma: any): any {
  return async (params: any, next: any) => {
    // Definimos las acciones que queremos auditar
    const actionsToAudit = [
      'create',
      'update',
      'delete',
      'createMany',
      'updateMany',
      'deleteMany',
      'upsert',
    ];
    const notAuditableModels: string[] = [
      'AuditLog',
      'DocumentApprovals',
      'AuditLogTransactionGroup',
    ];

    if (
      !actionsToAudit.includes(params.action) ||
      notAuditableModels.includes(params.model)
    ) {
      return next(params);
    }

    const { model, action, args } = params;
    const transactionGroupId = RequestContext.getStore()?.get('transactionGroupId');

    let beforeData = null;

    if (['update', 'delete', 'upsert'].includes(action) && args.where) {
      beforeData = await prisma[
        model.charAt(0).toLowerCase() + model.slice(1)
      ].findUnique({
        where: args.where,
      });
    }

    const result = await next(params);

    let afterData = null;
    let recordId = null;

    if (['create', 'update', 'upsert'].includes(action)) {
      afterData = result;
      recordId = result.id;
    } else if (action === 'delete') {
      beforeData = result;
      recordId = result.id;
    }

    if (transactionGroupId) {
      await (prisma as any).auditLog.create({
        data: {
          tableName: model,
          action,
          recordId: recordId?.toString(),
          beforeData: beforeData ? filterData(beforeData) : null,
          afterData: afterData ? filterData(afterData) : null,
          transactionGroupId,
        },
      });
    }

    return result;
  };
}

function filterData(data: any) {
  const filtered = { ...data };
  notTrackedAttributes.forEach((attr) => delete filtered[attr]);
  return filtered;
}
