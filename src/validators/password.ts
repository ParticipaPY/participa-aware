import { FormGroup } from "@angular/forms";

// FORM GROUP VALIDATORS
export function matchingPasswords(passwordKey: string, repeatPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let repeatPassword = group.controls[repeatPasswordKey];
      
      if (password.value !== repeatPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }