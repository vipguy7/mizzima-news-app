
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Crown, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  subscription_tier: string;
  subscribed: boolean;
  subscription_end: string | null;
}

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed, subscription_end')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email,
          subscription_tier: tier,
          subscribed: true,
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update subscription",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: `Successfully upgraded to ${tier} plan`
        });
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      tier: 'free',
      features: [
        'Access to free content',
        'Limited news articles',
        'Standard quality streaming',
        'Ads included'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      tier: 'premium',
      features: [
        'Unlimited access to all content',
        'HD quality streaming',
        'No advertisements',
        'Offline downloads',
        'Premium news articles',
        'Live TV channels'
      ],
      popular: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentTier = subscription?.subscription_tier || 'free';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Unlock premium content with our subscription plans</p>
        </div>

        {subscription && (
          <Card className="mb-8 bg-primary/10 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={currentTier === 'premium' ? 'default' : 'secondary'}>
                      {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                    </Badge>
                    {currentTier === 'premium' && (
                      <Crown className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>
                {subscription.subscription_end && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Expires on</p>
                    <p className="font-medium">
                      {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.tier} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  {plan.price}
                  {plan.tier !== 'free' && <span className="text-lg text-muted-foreground">/month</span>}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.tier === currentTier ? 'outline' : 'default'}
                  disabled={plan.tier === currentTier}
                  onClick={() => handleUpgrade(plan.tier)}
                >
                  {plan.tier === currentTier ? 'Current Plan' : 
                   plan.tier === 'free' ? 'Downgrade to Free' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Cancel anytime. No hidden fees. 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
