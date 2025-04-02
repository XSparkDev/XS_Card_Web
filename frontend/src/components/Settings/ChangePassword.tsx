import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Label } from "../UI/label";
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import "../../styles/ChangePassword.css";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Reset error when typing
    setFormErrors({
      ...formErrors,
      [name]: "",
    });

    // Calculate password strength if changing new password
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
    }, 1500);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "strength-weak";
    if (passwordStrength <= 3) return "strength-medium";
    return "strength-strong";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="change-password-container">
      <Card className="password-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure. Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        {isSuccess && (
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <span>Password changed successfully! Please use your new password the next time you log in.</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <CardContent className="password-form-content">
            <div className="form-group">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
              />
              {formErrors.currentPassword && (
                <p className="error-message">
                  <FaExclamationCircle className="error-icon" /> {formErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="form-group">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
              />
              {formData.newPassword && (
                <div className="password-strength">
                  <div className="strength-header">
                    <span className="strength-label">Password strength:</span>
                    <span className={`strength-text ${getPasswordStrengthColor()}`}>{getPasswordStrengthText()}</span>
                  </div>
                  <div className="strength-bar-container">
                    <div
                      className={`strength-bar ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <ul className="password-requirements">
                    <li className={formData.newPassword.length >= 8 ? "requirement-met" : "requirement"}>
                      {formData.newPassword.length >= 8 ? (
                        <FaCheckCircle className="requirement-icon-met" />
                      ) : (
                        <span className="requirement-bullet">•</span>
                      )}
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.newPassword) ? "requirement-met" : "requirement"}>
                      {/[A-Z]/.test(formData.newPassword) ? (
                        <FaCheckCircle className="requirement-icon-met" />
                      ) : (
                        <span className="requirement-bullet">•</span>
                      )}
                      At least 1 uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.newPassword) ? "requirement-met" : "requirement"}>
                      {/[0-9]/.test(formData.newPassword) ? (
                        <FaCheckCircle className="requirement-icon-met" />
                      ) : (
                        <span className="requirement-bullet">•</span>
                      )}
                      At least 1 number
                    </li>
                  </ul>
                </div>
              )}
              {formErrors.newPassword && (
                <p className="error-message">
                  <FaExclamationCircle className="error-icon" /> {formErrors.newPassword}
                </p>
              )}
            </div>

            <div className="form-group">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
              />
              {formErrors.confirmPassword && (
                <p className="error-message">
                  <FaExclamationCircle className="error-icon" /> {formErrors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="password-form-footer">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
