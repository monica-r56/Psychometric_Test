import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIntl, FormattedMessage } from 'react-intl';
import { Brain, User, IdCard, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector'; // adjust path as needed
import axios from 'axios';

export interface CandidateData {
  id?: number;
  name: string;
  candidate_id: string;
  email: string;
}

interface RegistrationProps {
  onComplete: (candidateData: CandidateData) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete }) => {
  const intl = useIntl();

  const [formData, setFormData] = useState<CandidateData>({
    name: '',
    candidate_id: '',
    email: '',
  });

  const [errors, setErrors] = useState<Partial<CandidateData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<CandidateData> = {};

    if (!formData.name.trim()) {
      newErrors.name = intl.formatMessage({ id: 'error.nameRequired' });
    }
    if (!formData.candidate_id.trim()) {
      newErrors.candidate_id = intl.formatMessage({ id: 'error.idRequired' });
    }
    if (!formData.email.trim()) {
      newErrors.email = intl.formatMessage({ id: 'error.emailRequired' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = intl.formatMessage({ id: 'error.emailInvalid' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/register', {
        name: formData.name,
        candidate_id: formData.candidate_id,
        email: formData.email,
      });

      onComplete(response.data); // pass received candidate data
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CandidateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4"
    >
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-10 h-10 text-white" />
              <h1 className="text-3xl font-bold text-white">
                <FormattedMessage id="app.title" />
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              <FormattedMessage id="registration.title" />
            </h2>
            <p className="text-white/90 text-sm">
              <FormattedMessage id="registration.subtitle" />
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-white flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <FormattedMessage id="registration.name" />
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={intl.formatMessage({ id: 'placeholder.name' })}
                className="bg-white/90 border-white/20"
              />
              {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="candidate_id" className="text-white flex items-center gap-2 mb-2">
                <IdCard className="w-4 h-4" />
                <FormattedMessage id="registration.id" />
              </Label>
              <Input
                id="candidate_id"
                type="text"
                value={formData.candidate_id}
                onChange={(e) => handleInputChange('candidate_id', e.target.value)}
                placeholder={intl.formatMessage({ id: 'placeholder.id' })}
                className="bg-white/90 border-white/20"
              />
              {errors.candidate_id && (
                <p className="text-red-300 text-sm mt-1">{errors.candidate_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-white flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                <FormattedMessage id="registration.email" />
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={intl.formatMessage({ id: 'placeholder.email' })}
                className="bg-white/90 border-white/20"
              />
              {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-3"
            >
              {loading ? 'Submitting...' : <FormattedMessage id="registration.submit" />}
            </Button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Registration;
