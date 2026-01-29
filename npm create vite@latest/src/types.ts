
export type Status = 'En attente' | 'Validé' | 'Terminé' | 'Payé' | 'Annulé' | 'Rejeté' | 'pending' | 'verified';
export type MilestoneStatus = 'À venir' | 'En cours' | 'Réalisé';
export type PaymentType = 'ROI' | 'Capital';
export type TransactionType = 'Dépôt' | 'Retrait' | 'Investissement';
export type UserAccountStatus = 'active' | 'suspended' | 'inactive';
export type UserRole = 'super_admin' | 'admin' | 'member' | 'investor';

export interface AdminPermissions {
  manageProjects: boolean;
  managePayouts: boolean;
  manageKYC: boolean;
  manageUsers: boolean;
}

export interface Milestone {
  date: string;
  label: string;
  status: MilestoneStatus;
}

export interface YieldEstimate {
  year: number;
  expectedReturn: number;
}

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  collectedAmount: number;
  returnRate: number;
  durationMonths: number;
  status: 'En cours' | 'Terminé' | 'Fermé' | 'active';
  startDate: string;
  endDate?: string;
  location?: string;
  imageUrl: string;
  description: string;
  fullDescription?: string;
  architecturalPlanUrl?: string;
  yieldEstimates?: YieldEstimate[];
  constructionSchedule?: Milestone[];
}

export interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  investorId: string;
  investorName: string;
  amount: number;
  date: string;
  status: Status;
}

export interface Payout {
  id: string;
  investmentId: string;
  projectId: string;
  projectName: string;
  investorId: string;
  investorName: string;
  amount: number;
  type: PaymentType;
  dueDate: string;
  status: Status;
  paymentDate?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: Status;
  method: string;
  projectName?: string;
}

export interface Commission {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  rate: number;
  totalAmount: number;
  collectedAmount: number;
  status: Status;
}

export interface KYCVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: 'passport' | 'nni' | 'driver_license';
  status: 'none' | 'pending' | 'verified' | 'rejected';
  submittedAt: string;
  documentUrl: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  registrationDate: string;
  totalInvested: number;
  balance: number;
  avatar?: string;
  permissions?: AdminPermissions;
}
