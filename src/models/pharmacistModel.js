import mongoose from 'mongoose';

const pharmacistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, lowercase: true },
        image: {
            type: String,
            default: 'profileImages/defaultPharmacistImage.png'
        },
        phone: { type: Number, required: true, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        pharmacyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'pharmacy',
            required: true,
            default: null
        },
        isBlocked: { type: Boolean, required: true, default: false }
    },
    { timestamps: true }
);

const Pharmacist = mongoose.model('pharmacist', pharmacistSchema);

export default Pharmacist;
