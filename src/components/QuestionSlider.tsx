import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface QuestionSliderProps {
  value: number; // Expected to be one of -2, -1, 0, 1, 2
  onChange: (value: number) => void;
  thisOption: string;
  thatOption: string;
}

const QuestionSlider: React.FC<QuestionSliderProps> = ({
  value,
  onChange,
  thisOption,
  thatOption,
}) => {
  const getLabel = (val: number) => {
    switch (val) {
      case -2:
        return 'Strongly This';
      case -1:
        return 'This';
      case 0:
        return 'Neutral';
      case 1:
        return 'That';
      case 2:
        return 'Strongly That';
      default:
        return '';
    }
  };

  const handleSliderChange = (values: number[]) => {
    const remappedValue = values[0] - 2; 
    onChange(remappedValue);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Options Display */}
      <div className="flex justify-between items-start mb-8 gap-8">
        <motion.div
          className={`flex-1 p-4 rounded-lg transition-all duration-300 ${
            value < 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <div className="text-sm font-medium text-blue-600 mb-2">This Option</div>
          <div className="text-gray-800 leading-relaxed">{thisOption}</div>
        </motion.div>

        <motion.div
          className={`flex-1 p-4 rounded-lg transition-all duration-300 ${
            value > 0 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-200'
          }`}
        >
          <div className="text-sm font-medium text-purple-600 mb-2">That Option</div>
          <div className="text-gray-800 leading-relaxed">{thatOption}</div>
        </motion.div>
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <Slider
          value={[value + 2]} 
          onValueChange={handleSliderChange}
          max={4}
          min={0}
          step={1}
          className="w-full"
        />
        
        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Strongly This</span>
          <span>This</span>
          <span>Neutral</span>
          <span>That</span>
          <span>Strongly That</span>
        </div>
      </div>

      {/* Current value display */}
      <div className="text-center">
        <div className={`inline-block px-4 py-2 rounded-full text-white font-medium ${
          value === 0 ? 'bg-gray-400' : value < 0 ? 'bg-blue-500' : 'bg-blue-500'
        }`}>
          {getLabel(value)}
        </div>
      </div>
    </div>
  );
};

export default QuestionSlider;
