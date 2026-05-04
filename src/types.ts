export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  photo: string;
  role?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface BusinessHours {
  open: string;
  close: string;
}

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  logo: string;
  services: Service[];
  barbers: Barber[];
  hours: Record<string, BusinessHours>;
  inactiveDates?: string[];
}

export interface Appointment {
  id: string;
  shopId: string;
  shopSlug: string;
  serviceId: string;
  barberId: string;
  clientName: string;
  clientPhone: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}
