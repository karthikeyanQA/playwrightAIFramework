import { User, UserRole, UserStatus, LoginCredentials } from '../../models/user.model';
import { DataHelper } from '../../utils/helpers/data-helper';

/**
 * UserBuilder creates User objects for tests programmatically.
 * Use build() to get the plain object. Supports method chaining.
 *
 * Example:
 *   const user = new UserBuilder().asAdmin().withEmail('admin@test.com').build();
 */
export class UserBuilder {
  private data: User = {
    username: `user_${DataHelper.generateRandomString(6)}`,
    email: DataHelper.generateRandomEmail(),
    firstName: 'Test',
    lastName: 'User',
    password: 'Test@1234',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };

  withUsername(username: string): this {
    this.data.username = username;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withPassword(password: string): this {
    this.data.password = password;
    return this;
  }

  withRole(role: UserRole): this {
    this.data.role = role;
    return this;
  }

  withStatus(status: UserStatus): this {
    this.data.status = status;
    return this;
  }

  asAdmin(): this {
    this.data.role = UserRole.ADMIN;
    this.data.username = `admin_${DataHelper.generateRandomString(6)}`;
    this.data.email = DataHelper.generateRandomEmail('admin.test.com');
    return this;
  }

  asGuest(): this {
    this.data.role = UserRole.GUEST;
    this.data.username = `guest_${DataHelper.generateRandomString(6)}`;
    this.data.email = DataHelper.generateRandomEmail('guest.test.com');
    return this;
  }

  asInactive(): this {
    this.data.status = UserStatus.INACTIVE;
    return this;
  }

  asSuspended(): this {
    this.data.status = UserStatus.SUSPENDED;
    return this;
  }

  build(): User {
    return { ...this.data };
  }

  buildCredentials(): LoginCredentials {
    return {
      username: this.data.email,
      password: this.data.password ?? 'Test@1234',
    };
  }

  /** Build multiple unique users at once */
  static buildMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => new UserBuilder().build()).map((u) => ({
      ...u,
      ...overrides,
    }));
  }
}
