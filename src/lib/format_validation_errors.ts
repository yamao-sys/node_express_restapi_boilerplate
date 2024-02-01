import { ValidationError } from "class-validator";

export function format_validation_errors(errors: ValidationError[]) {
	return errors.map((error) => {
		let messages = []
		for (var key in error.constraints) {
			messages.push(error.constraints[key])
		}
		return messages
	}).flat().join("\n");
}
