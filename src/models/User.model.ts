import { injectable } from "inversify";
import { Repository } from "typeorm";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { compare, hash } from "bcrypt";
import { validate } from "class-validator";
import { IUserModel, userParams } from "./User.interface";

@injectable()
export class UserModel implements IUserModel {
	private _userRepository: Repository<User>;

	public constructor() {
		this._userRepository = AppDataSource.getRepository(User);
	}

	public async buildNewUser(params: userParams) {
		const hashedPassword = params.password ? await hash(params.password, 10) : '';

		const user = new User();

		user.email = params.email;
		user.password = hashedPassword;

		return user;
	}

	public async validate(user: User) {
		return validate(user);
	}

	public async save(user: User) {
		return this._userRepository.save(user)
	}

	public async signin(params: userParams) {
		const user = await this._userRepository.findOneBy({
			email: params.email
		});

		if (!user) return null;

		const isValidPassword = await compare(params.password, user.password);
		return isValidPassword ? user : null;
	}
}
