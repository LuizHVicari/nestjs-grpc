import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { User, CreateUserDto, UpdateUserDto, Users, PaginationDto } from '@app/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
	private readonly users: User[] = []
	
	onModuleInit() {
		for (let i = 0; i <= 100; i++) {
			this.create({
				username: randomUUID(),
				password: randomUUID(),
				age: i
			})
		}
	}

	create(createUserDto: CreateUserDto): User {
		const user: User = {
			...createUserDto,
			subscribed: false,
			socialMedia: {},
			id: randomUUID()
		}
		this.users.push(user)
		return user
	}

	findAll(): Users {
		return { users: this.users }
	}

	findOne(id: string) {
		return this.users.find(user => user.id === id)
	}

	update(id: string, updateUserDto: UpdateUserDto) {
		const userIndex = this.users.findIndex((user) => user.id === id)
		if (userIndex === -1) throw new NotFoundException(`User not fount by id ${id}`)
		this.users[userIndex] = {
			...this.users[userIndex],
			...updateUserDto
		}
		return this.users[userIndex]
	}

	remove(id: string) {
		const userIndex = this.users.findIndex((user) => user.id === id)
		if (userIndex === -1) throw new NotFoundException(`User not fount by id ${id}`)
		return this.users.splice(userIndex)[0]
	}

	queryUsers(paginationDtoStream: Observable<PaginationDto>): Observable<Users> {
		const subject = new Subject<Users>()
		const onNext = (paginationDto: PaginationDto) => {
			const start = paginationDto.page * paginationDto.skip
			subject.next({
				users: this.users.slice(start, start + paginationDto.skip)
			})
		}
		const onComplete = () => subject.complete()
		paginationDtoStream.subscribe({
			next: onNext,
			complete: onComplete
		})
		return subject.asObservable()
	}
}
