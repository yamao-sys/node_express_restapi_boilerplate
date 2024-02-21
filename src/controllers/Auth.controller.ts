import express from "express"
import { inject, injectable } from "inversify"
import { IUserModel } from "../models/User.interface"
import { TYPES } from "../inject.types"
import { format_validation_errors } from "../lib/format_validation_errors"
import { generateToken } from "../lib/auth"

@injectable()
export class AuthController {
  private _userModel: IUserModel

  public constructor(
    @inject(TYPES.IUserModel)
    userModel: IUserModel,
  ) {
    this._userModel = userModel
  }

  public async signup(req: express.Request, res: express.Response) {
    const user = await this._userModel.buildNewUser(req.body)

    const validation_errors = await this._userModel.validate(user)
    if (validation_errors.length > 0) {
      return res.json({
        result: "FAILED TO SIGNUP",
        errors: format_validation_errors(validation_errors),
      })
    }

    await this._userModel.save(user)

    res.json({ result: "SUCCESS" })
  }

  public async login(req: express.Request, res: express.Response) {
    // signinメソッドはAuthModel(AuthService)を作った方が良さそう
    const user = await this._userModel.signin(req.body)

    if (user) {
      // res.cookie('token', generateToken({ id: user.id }), { httpOnly: true });
      res.cookie("token", generateToken({ id: user.id }))
      res.json({ result: "SUCCESS" })
    } else {
      res.status(404).send("メールアドレスまたはパスワードが異なります。")
    }
  }
}
