import mongoose from 'mongoose';

const { Schema } = mongoose;

const medicineSchema = new Schema({
    name: { type: String, required: true, unique: true },
    price: { type: String, required: true },
    Is_discontinued: { type: String, default: false },
    manufacturer_name: { type: String, required: true },
    type: { type: String, default: 'allopathy' },
    pack_size_label: { type: String, required: true },
    short_composition1: { type: String, required: true },
    short_composition2: { type: String, default: '' }
});

const Medicine = mongoose.model('medicines', medicineSchema);
export default Medicine;
