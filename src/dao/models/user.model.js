import mongoose from "mongoose";

const userCollection = "Users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    password: String,
    cart: [{
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Carts',
            required: true
        }
    }],
    rol: { type: String, default: "user" },
    documents:[{
        name_document: String,
        reference: String
    }],
    last_connection: String
});

const firstCollection = mongoose.model(userCollection, userSchema);

export default firstCollection