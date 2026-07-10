import { Customer } from '@domain/customer/entities/customer.entity';

export abstract class CustomerRepository {
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract create(customer: Customer): Promise<Customer>;
}
