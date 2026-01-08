import { db } from './database';

export interface DatabaseBackup {
  version: number;
  exportDate: string;
  data: {
    products: any[];
    categories: any[];
    restaurantTables: any[];
    orders: any[];
    settings: any[];
    dailySummaries: any[];
    notifications: any[];
    customers: any[];
    rawMaterials: any[];
    productIngredients: any[];
    systemUsers: any[];
    activityLogs: any[];
    workShifts: any[];
    loyaltyPrograms: any[];
    loyaltyTransactions: any[];
    loyaltyRewards: any[];
    tableReservations: any[];
    expenses: any[];
    offers: any[];
    salesGoals: any[];
  };
}

export async function exportDatabase(): Promise<DatabaseBackup> {
  const [
    products,
    categories,
    restaurantTables,
    orders,
    settings,
    dailySummaries,
    notifications,
    customers,
    rawMaterials,
    productIngredients,
    systemUsers,
    activityLogs,
    workShifts,
    loyaltyPrograms,
    loyaltyTransactions,
    loyaltyRewards,
    tableReservations,
    expenses,
    offers,
    salesGoals,
  ] = await Promise.all([
    db.products.toArray(),
    db.categories.toArray(),
    db.restaurantTables.toArray(),
    db.orders.toArray(),
    db.settings.toArray(),
    db.dailySummaries.toArray(),
    db.notifications.toArray(),
    db.customers.toArray(),
    db.rawMaterials.toArray(),
    db.productIngredients.toArray(),
    db.systemUsers.toArray(),
    db.activityLogs.toArray(),
    db.workShifts.toArray(),
    db.loyaltyPrograms.toArray(),
    db.loyaltyTransactions.toArray(),
    db.loyaltyRewards.toArray(),
    db.tableReservations.toArray(),
    db.expenses.toArray(),
    db.offers.toArray(),
    db.salesGoals.toArray(),
  ]);

  return {
    version: 9,
    exportDate: new Date().toISOString(),
    data: {
      products,
      categories,
      restaurantTables,
      orders,
      settings,
      dailySummaries,
      notifications,
      customers,
      rawMaterials,
      productIngredients,
      systemUsers,
      activityLogs,
      workShifts,
      loyaltyPrograms,
      loyaltyTransactions,
      loyaltyRewards,
      tableReservations,
      expenses,
      offers,
      salesGoals,
    },
  };
}

export async function importDatabase(backup: DatabaseBackup): Promise<void> {
  // Clear all tables
  await Promise.all([
    db.products.clear(),
    db.categories.clear(),
    db.restaurantTables.clear(),
    db.orders.clear(),
    db.settings.clear(),
    db.dailySummaries.clear(),
    db.notifications.clear(),
    db.customers.clear(),
    db.rawMaterials.clear(),
    db.productIngredients.clear(),
    db.systemUsers.clear(),
    db.activityLogs.clear(),
    db.workShifts.clear(),
    db.loyaltyPrograms.clear(),
    db.loyaltyTransactions.clear(),
    db.loyaltyRewards.clear(),
    db.tableReservations.clear(),
    db.expenses.clear(),
    db.offers.clear(),
    db.salesGoals.clear(),
  ]);

  // Import all data
  const { data } = backup;

  await Promise.all([
    data.products.length > 0 && db.products.bulkAdd(data.products.map(p => ({ ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) }))),
    data.categories.length > 0 && db.categories.bulkAdd(data.categories),
    data.restaurantTables.length > 0 && db.restaurantTables.bulkAdd(data.restaurantTables.map(t => ({ ...t, occupiedAt: t.occupiedAt ? new Date(t.occupiedAt) : undefined }))),
    data.orders.length > 0 && db.orders.bulkAdd(data.orders.map(o => ({ ...o, createdAt: new Date(o.createdAt), completedAt: o.completedAt ? new Date(o.completedAt) : undefined, deliveryTime: o.deliveryTime ? new Date(o.deliveryTime) : undefined }))),
    data.settings.length > 0 && db.settings.bulkAdd(data.settings),
    data.dailySummaries.length > 0 && db.dailySummaries.bulkAdd(data.dailySummaries),
    data.notifications.length > 0 && db.notifications.bulkAdd(data.notifications.map(n => ({ ...n, createdAt: new Date(n.createdAt) }))),
    data.customers.length > 0 && db.customers.bulkAdd(data.customers.map(c => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }))),
    data.rawMaterials.length > 0 && db.rawMaterials.bulkAdd(data.rawMaterials.map(r => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) }))),
    data.productIngredients.length > 0 && db.productIngredients.bulkAdd(data.productIngredients),
    data.systemUsers.length > 0 && db.systemUsers.bulkAdd(data.systemUsers.map(u => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) }))),
    data.activityLogs.length > 0 && db.activityLogs.bulkAdd(data.activityLogs.map(a => ({ ...a, createdAt: new Date(a.createdAt) }))),
    data.workShifts.length > 0 && db.workShifts.bulkAdd(data.workShifts.map(w => ({ ...w, startTime: new Date(w.startTime), endTime: w.endTime ? new Date(w.endTime) : undefined }))),
    data.loyaltyPrograms.length > 0 && db.loyaltyPrograms.bulkAdd(data.loyaltyPrograms.map(l => ({ ...l, createdAt: new Date(l.createdAt), updatedAt: new Date(l.updatedAt) }))),
    data.loyaltyTransactions.length > 0 && db.loyaltyTransactions.bulkAdd(data.loyaltyTransactions.map(lt => ({ ...lt, createdAt: new Date(lt.createdAt) }))),
    data.loyaltyRewards.length > 0 && db.loyaltyRewards.bulkAdd(data.loyaltyRewards.map(lr => ({ ...lr, createdAt: new Date(lr.createdAt) }))),
    data.tableReservations.length > 0 && db.tableReservations.bulkAdd(data.tableReservations.map(tr => ({ ...tr, reservationDate: new Date(tr.reservationDate), createdAt: new Date(tr.createdAt), updatedAt: new Date(tr.updatedAt) }))),
    data.expenses.length > 0 && db.expenses.bulkAdd(data.expenses.map(e => ({ ...e, date: new Date(e.date), createdAt: new Date(e.createdAt) }))),
    data.offers.length > 0 && db.offers.bulkAdd(data.offers.map(o => ({ ...o, startDate: new Date(o.startDate), endDate: new Date(o.endDate), createdAt: new Date(o.createdAt) }))),
    data.salesGoals.length > 0 && db.salesGoals.bulkAdd(data.salesGoals.map(sg => ({ ...sg, startDate: new Date(sg.startDate), createdAt: new Date(sg.createdAt) }))),
  ]);
}

export function downloadBackup(backup: DatabaseBackup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `restaurant-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateBackup(data: any): data is DatabaseBackup {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.version === 'number' &&
    typeof data.exportDate === 'string' &&
    typeof data.data === 'object' &&
    Array.isArray(data.data.products) &&
    Array.isArray(data.data.categories) &&
    Array.isArray(data.data.orders)
  );
}
