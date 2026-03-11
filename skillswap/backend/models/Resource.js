const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['document', 'video', 'link', 'other'], default: 'document' },
    fileUrl: { type: String },
    fileSize: { type: Number }, // in bytes
    fileName: { type: String },
    mimeType: { type: String },
    tags: [String],
    category: { type: String },
    downloads: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
