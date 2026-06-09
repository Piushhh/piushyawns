import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tech: {
    type: [String],
    default: [],
  },
  link: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['live', 'wip', 'coming-soon'],
    default: 'wip',
  },
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
