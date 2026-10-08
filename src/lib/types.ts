// Shared types mirroring the B7A6 backend responses (see API_NOTES.md).

export type Role = "TENANT" | "OWNER" | "ADMIN";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  provider: "LOCAL" | "GOOGLE";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type PropertyType =
  | "APARTMENT"
  | "STUDIO"
  | "HOUSE"
  | "CONDO"
  | "DUPLEX"
  | "ROOM";

export type RoomType = "SINGLE" | "DOUBLE" | "SUITE" | "STUDIO" | "QUAD";

export type ListingStatus = "ACTIVE" | "INACTIVE";

export interface PropertySummary {
  id: string;
  title: string;
  address: string;
  city: string;
  area: string | null;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  amenities: string[];
  images: string[];
  status: ListingStatus;
  createdAt: string;
  roomCount: number;
  minRent: number | null;
}

export interface Room {
  id: string;
  roomType: RoomType;
  rentAmount: number;
  isAvailable: boolean;
  capacity: number;
  images: string[];
  createdAt: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface PropertyDetail extends Omit<PropertySummary, "roomCount" | "minRent"> {
  description: string;
  updatedAt: string;
  rooms: Room[];
  owner: PropertyOwner;
}

export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface ViewingRequest {
  id: string;
  status: RequestStatus;
  requestedDate: string;
  notes: string | null;
  createdAt: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  room?: {
    id: string;
    roomType: RoomType;
    rentAmount: number;
    property?: { id: string; title: string; city: string };
  };
}

export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Application {
  id: string;
  status: ApplicationStatus;
  moveInDate: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  tenancy?: { id: string; startDate: string; rentAmount: number; status: string } | null;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  room: {
    id: string;
    roomType: RoomType;
    rentAmount: number;
    capacity: number;
    isAvailable: boolean;
    images: string[];
    property: {
      id: string;
      title: string;
      address: string;
      city: string;
      propertyType: PropertyType;
      images: string[];
    };
  };
}

export type TenancyStatus = "ACTIVE" | "ENDED" | "PENDING";

export interface Tenancy {
  id: string;
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  status: TenancyStatus;
  application?: { id: string; note: string | null; moveInDate: string };
  room?: {
    id: string;
    roomType: RoomType;
    rentAmount: number;
    images: string[];
    property: {
      id: string;
      title: string;
      address: string;
      city: string;
      area: string | null;
      propertyType: PropertyType;
      images: string[];
    };
  };
}

export type RentPaymentStatus = "DUE" | "PAID" | "OVERDUE" | "FAILED";

export interface RentPayment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: RentPaymentStatus;
  tenancyId?: string;
  period?: string;
}

export type PaymentStatus = "PENDING" | "VALID" | "FAILED" | "CANCELLED";

export interface Payment {
  id: string;
  tranId: string;
  status: PaymentStatus;
  amount: number;
  currency?: string;
  gateway: string;
  purpose: string;
  createdAt: string;
  propertyTitle?: string;
}

export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface MaintenanceRequest {
  id: string;
  category: string;
  description: string;
  images: string[];
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  createdAt: string;
  resolvedAt: string | null;
  tenant: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null };
  room: {
    id: string;
    property: { id: string; title: string; address: string; city: string };
  };
}

export interface BillSplit {
  id: string;
  billType: string;
  totalAmount: number;
  dueDate: string;
  status: "PENDING" | "SETTLED";
  shares?: { id: string; tenantId: string; amount: number; status: string }[];
}

export interface AdminDashboardStats {
  totalUsers?: number;
  totalProperties?: number;
  totalBookings?: number;
  totalRevenue?: number;
  users?: number;
  properties?: number;
  payments?: number;
  tenancies?: number;
  [key: string]: number | undefined;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface HealthResponse {
  uptime: number;
  timestamp: string;
}
