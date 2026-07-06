// import mongoose, { Document } from "mongoose";
// import bcrypt from "bcryptjs";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: "user" | "admin";
//   isVerified: boolean;
//   verificationToken?: string;
//   resetPasswordToken?: string;
//   resetPasswordExpires?: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password: { type: String, required: true, minlength: 6 },
//     role: { type: String, enum: ["user", "admin"], default: "user" },
//     isVerified: { type: Boolean, default: false },
//     verificationToken: String,
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = function (candidatePassword: string) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   delete obj.verificationToken;
//   delete obj.resetPasswordToken;
//   delete obj.resetPasswordExpires;
//   return obj;
// };

// export default mongoose.model<IUser>("User", userSchema);


import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "user" | "admin";
export type AuthProvider = "local" | "google";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  provider: AuthProvider;
  googleId?: string;
  avatar?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },  
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 12);

//   next();
// });
userSchema.pre("save", async function (next) {
  // Skip if no password (Google account)
  if (!this.password) {
    return next();
  }

  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// userSchema.methods.comparePassword = function (candidatePassword: string) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
};

export default mongoose.model<IUser>("User", userSchema);


