import mongoose from "mongoose";
import { Password } from "../utilities/password";

interface UserAttrs {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret.password;
      delete ret._id;

      // For some reason, setting versionKey to false does not remove this when signing in.
      // Hence adding this
      delete ret.__v;
    }
  },
  versionKey: false
});

userSchema.pre('save', async function(done) {
  const propertyToCheck = 'password';
  if (this.isModified(propertyToCheck)) {
    const hashed = await Password.toHash(this.get(propertyToCheck));
    this.set(propertyToCheck, hashed);
  }

  done();
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
