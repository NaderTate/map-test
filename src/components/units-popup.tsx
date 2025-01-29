/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import UnitCard from "./unit-card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";

type Props = {
  unitsData: { units: Unit_[] } | null;
};

type FormErrors = {
  name?: string;
  phone?: string;
  gender?: string;
  submit?: string;
};

const UnitsPopup = ({ unitsData }: Props) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit_ | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    } else if (formData.name.length < 3) {
      newErrors.name = "يجب أن يكون الاسم 3 أحرف على الأقل";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الجوال مطلوب";
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = "يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام";
    }

    if (!formData.gender) {
      newErrors.gender = "الجنس مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUnitClick = (unit: Unit_) => {
    setSelectedUnit(unit);
    setSubmitSuccess(false);
  };

  const handleBackClick = () => {
    setSelectedUnit(null);
    setFormData({ name: "", phone: "", gender: "" });
    setErrors({});
    setSubmitSuccess(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://aleen-server.wessal.app/api/sales/cycles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: {
              name: formData.name,
              phone: formData.phone,
              gender: formData.gender,
            },
            unitId: selectedUnit?._id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء إرسال الطلب");
      }

      setSubmitSuccess(true);
      setFormData({ name: "", phone: "", gender: "" });
    } catch (err: any) {
      console.error(err);
      setErrors({
        ...errors,
        submit: "حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });
    if (errors.gender) {
      setErrors({
        ...errors,
        gender: undefined,
      });
    }
  };

  if (selectedUnit) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>العودة</span>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Details */}
          <div>
            <UnitCard unit={selectedUnit} />
          </div>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">حجز الوحدة</CardTitle>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <Alert className="mb-4 bg-green-50">
                  <AlertDescription className="text-right text-green-600">
                    تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="الاسم"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full text-right ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm text-right mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      dir="ltr"
                      type="tel"
                      name="phone"
                      className={`w-full text-right ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      value={formData.phone}
                      placeholder="رقم الجوال"
                      onChange={handleInputChange}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm text-right mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Select
                      dir="rtl"
                      value={formData.gender}
                      onValueChange={handleGenderChange}
                    >
                      <SelectTrigger
                        className={errors.gender ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm text-right mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      "تأكيد الحجز"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {unitsData?.units
        ?.filter((unit: Unit_) => unit.status === "vacant")
        .map((unit: Unit_) => (
          <UnitCard
            key={unit._id}
            unit={unit}
            onClick={() => handleUnitClick(unit)}
          />
        ))}
    </div>
  );
};

export default UnitsPopup;
