import { Injectable } from '@nestjs/common';
import { Customer as PrismaCustomer } from '@prisma/client';
import { Customer } from '@domain/customer/entities/customer.entity';
import { CustomerRepository } from '@domain/customer/repositories/customer.repository';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });
    return customer ? toDomain(customer) : null;
  }

  async create(customer: Customer): Promise<Customer> {
    const created = await this.prisma.customer.create({
      data: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
    });
    return toDomain(created);
  }
}

function toDomain(customer: PrismaCustomer): Customer {
  return new Customer(
    customer.id,
    customer.fullName,
    customer.email,
    customer.phoneNumber,
  );
}
