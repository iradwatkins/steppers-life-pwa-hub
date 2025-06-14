import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCart, type AttendeeInfo } from '@/contexts/CartContext';
import { ArrowLeft, ArrowRight, User, ShoppingCart } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  emergencyContact: z.string().min(2, 'Emergency contact name is required'),
  emergencyPhone: z.string().min(10, 'Emergency contact phone is required'),
  dietaryRestrictions: z.string().optional(),
  specialRequests: z.string().optional(),
});

const CheckoutDetailsPage = () => {
  const navigate = useNavigate();
  const { state, setAttendeeInfo, setStep } = useCart();

  const form = useForm<AttendeeInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: state.attendeeInfo?.firstName || '',
      lastName: state.attendeeInfo?.lastName || '',
      email: state.attendeeInfo?.email || '',
      phone: state.attendeeInfo?.phone || '',
      emergencyContact: state.attendeeInfo?.emergencyContact || '',
      emergencyPhone: state.attendeeInfo?.emergencyPhone || '',
      dietaryRestrictions: state.attendeeInfo?.dietaryRestrictions || '',
      specialRequests: state.attendeeInfo?.specialRequests || '',
    }
  });

  useEffect(() => {
    setStep(2);
    // Redirect if no items in cart
    if (state.items.length === 0) {
      navigate(`/events/${state.eventId}/tickets`);
    }
  }, [setStep, state.items.length, state.eventId, navigate]);

  const onSubmit = (data: AttendeeInfo) => {
    setAttendeeInfo(data);
    navigate('/checkout/payment');
  };

  const handleBack = () => {
    navigate(`/events/${state.eventId}/tickets`);
  };

  if (state.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div className="text-sm text-muted-foreground">Step 2 of 4</div>
          </div>
          <Progress value={50} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">Selection</span>
            <span className="font-medium text-stepping-purple">Details</span>
            <span className="text-muted-foreground">Payment</span>
            <span className="text-muted-foreground">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attendee Details Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Attendee Information
                </CardTitle>
                <CardDescription>
                  Please provide your details for ticket registration and event communication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dietaryRestrictions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dietary Restrictions</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Please list any dietary restrictions or allergies"
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specialRequests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any special accommodations or requests"
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button type="button" variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Selection
                      </Button>
                      <Button type="submit">
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>{state.eventTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{item.ticketType.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.ticketType.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${item.ticketType.price * item.quantity}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${state.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;