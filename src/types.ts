/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceCard {
  id: string;
  iconName: "office" | "calendar" | "spray" | "gears";
  title: string;
  description: string;
  price: string;
  delayMs: number;
}

export interface BookingFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  officeSize: string;
  startDate?: string;
  hasSupplies: "yes" | "no" | "dont_know" | "";
  notes: string;
}

export interface FormErrorState {
  companyName?: string;
  contactName?: string;
  email?: string;
  serviceType?: string;
  officeSize?: string;
  notes?: string;
}
