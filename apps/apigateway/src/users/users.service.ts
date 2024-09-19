import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto, PaginationDto, UpdateUserDto, USERS_SERVICE_NAME, UsersServiceClient} from '@app/common';
import { AUTH_SERVICE } from './constants';
import { ClientGrpc } from '@nestjs/microservices';
import { ReplaySubject, skip } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UsersServiceClient

  constructor(
    @Inject(AUTH_SERVICE)
    private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UsersServiceClient>(
      USERS_SERVICE_NAME
    )
  }

  create(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto)
  }

  findAll() {
    return this.userService.findAllUsers({})
  }

  findOne(id: string) {
    return this.userService.findOneUser({ id })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userService.updateUser({ id, ...updateUserDto })
  }

  remove(id: string) {
    return this.userService.removeUser({ id })
  }

  emailUsers() {
    const users$ = new ReplaySubject<PaginationDto>()

    users$.next({ page: 0, skip: 25 })
    users$.next({ page: 1, skip: 25 })
    users$.next({ page: 2, skip: 25 })
    users$.next({ page: 3, skip: 25 })

    users$.complete()

    let chunkNumber = 1

    this.userService.queryUsers(users$).subscribe( users => {
      console.log('Chunk', chunkNumber, users)
      chunkNumber++

    })
  }
}
