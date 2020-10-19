const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    verification_token :
    {
      type:String,
      required:true,
    },
    verified:
    {
      type : Boolean,
      required:true,
      default:false,
    },
    courses: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
    coupon: { type: String, default: uuidv4() },
    isAdmin: {
      // they have full access to the courses they can remove any course
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, autoIndex: true }
);

// for a particular user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const JWT_SECRET = config.get("JWT_SECRET");
  const payload = {
    user: {
      id: user.id,
    },
  };

  const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: "2 days" });

  user.tokens = user.tokens.concat({ token });
  user.verification_token=token;

  await user.save();

  return token;
};

// for the entire model
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Incorrect password/username field");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Incorrect password/username field");
  }

  return user;
};

userSchema.statics.findByEmail = async(email) =>{
  const user = await User.findOne({ email });
  return user;
};

userSchema.statics.deleteUser = async(email)=>{
  const user = this;
  user.deleteOne();
}

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
