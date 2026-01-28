/**
 * Form Validations Utility
 * Provides reusable validation rules for all forms
 */

export const validations = {
  // Required field validation
  required: (fieldName) => ({
    required: `${fieldName} is required`,
  }),

  // Team validations
  teamName: {
    required: "Team name is required",
    minLength: {
      value: 3,
      message: "Team name must be at least 3 characters",
    },
    maxLength: {
      value: 50,
      message: "Team name must not exceed 50 characters",
    },
  },

  // Tournament validations
  tournamentName: {
    required: "Tournament name is required",
    minLength: {
      value: 3,
      message: "Tournament name must be at least 3 characters",
    },
    maxLength: {
      value: 100,
      message: "Tournament name must not exceed 100 characters",
    },
  },

  description: {
    maxLength: {
      value: 500,
      message: "Description must not exceed 500 characters",
    },
  },

  city: {
    required: "City is required",
    minLength: {
      value: 2,
      message: "City name must be at least 2 characters",
    },
    maxLength: {
      value: 50,
      message: "City name must not exceed 50 characters",
    },
  },

  sport: {
    required: "Please select a sport",
  },

  // Match validations
  matchName: {
    required: "Match name is required",
    minLength: {
      value: 3,
      message: "Match name must be at least 3 characters",
    },
    maxLength: {
      value: 100,
      message: "Match name must not exceed 100 characters",
    },
  },

  date: {
    required: "Date is required",
  },

  time: {
    required: "Time is required",
  },

  venue: {
    required: "Venue is required",
    minLength: {
      value: 3,
      message: "Venue must be at least 3 characters",
    },
    maxLength: {
      value: 100,
      message: "Venue must not exceed 100 characters",
    },
  },

  // Player profile validations
  fullName: {
    required: "Full name is required",
    minLength: {
      value: 3,
      message: "Full name must be at least 3 characters",
    },
    maxLength: {
      value: 50,
      message: "Full name must not exceed 50 characters",
    },
  },

  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },

  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^[0-9]{10}$/,
      message: "Phone number must be 10 digits",
    },
  },

  height: {
    min: {
      value: 1,
      message: "Height must be at least 1 ft",
    },
    max: {
      value: 8,
      message: "Height must not exceed 8 ft",
    },
  },

  weight: {
    required: "Weight is required",
    min: {
      value: 30,
      message: "Weight must be at least 30 kg",
    },
    max: {
      value: 200,
      message: "Weight must not exceed 200 kg",
    },
  },

  dateOfBirth: {
    required: "Date of birth is required",
  },

  // Organizer validations
  organizerName: {
    required: "Organizer name is required",
    minLength: {
      value: 3,
      message: "Name must be at least 3 characters",
    },
    maxLength: {
      value: 50,
      message: "Name must not exceed 50 characters",
    },
  },

  // Tournament registration
  entryFee: {
    min: {
      value: 0,
      message: "Entry fee cannot be negative",
    },
    max: {
      value: 1000000,
      message: "Entry fee is too high",
    },
  },

  maxTeams: {
    min: {
      value: 2,
      message: "Minimum teams must be at least 2",
    },
    max: {
      value: 1000,
      message: "Maximum teams cannot exceed 1000",
    },
  },

  prizePool: {
    min: {
      value: 0,
      message: "Prize pool cannot be negative",
    },
  },
};

/**
 * Validate date - must be in future
 */
export const validateFutureDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return "Date must be in the future";
  }
  return true;
};

/**
 * Validate end date - must be after start date
 */
export const validateEndDate = (endDate, startDate) => {
  if (new Date(endDate) <= new Date(startDate)) {
    return "End date must be after start date";
  }
  return true;
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSize = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeInMB}MB`;
  }
  return true;
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
  }
  return true;
};

/**
 * Validate at least one sport selected
 */
export const validateAtLeastOneSport = (sports) => {
  if (!sports || sports.length === 0) {
    return "Please select at least one sport";
  }
  return true;
};

/**
 * Validate at least one player selected
 */
export const validateAtLeastOnePlayer = (players) => {
  if (!players || players.length === 0) {
    return "Please select at least one player";
  }
  return true;
};
