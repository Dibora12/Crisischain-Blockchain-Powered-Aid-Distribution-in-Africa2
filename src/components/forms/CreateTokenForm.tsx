
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateToken } from '@/hooks/useTokens';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { WalletSelector } from '@/components/WalletSelector';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Token name must be at least 2 characters'),
  symbol: z.string().min(2, 'Token symbol must be at least 2 characters').max(10, 'Symbol too long'),
  supply: z.number().min(1, 'Supply must be at least 1'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateTokenFormProps {
  onSuccess?: () => void;
}

export function CreateTokenForm({ onSuccess }: CreateTokenFormProps) {
  const { connectedWallet, accountId } = useHederaWallet();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      symbol: '',
      supply: 1000,
    },
  });

  const createToken = useCreateToken();

  const onSubmit = async (data: FormData) => {
    if (!connectedWallet || !accountId) {
      return;
    }

    const walletProvider = connectedWallet.toLowerCase().includes('hashpack') ? 'hashpack' : 'blade';

    await createToken.mutateAsync({
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      supply: data.supply,
      walletProvider,
    });
    
    form.reset();
    onSuccess?.();
  };

  if (!connectedWallet || !accountId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Hedera wallet to create tokens
        </p>
        <WalletSelector />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Crisis Aid Token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Symbol</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CAT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="supply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Supply</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min="1"
                  placeholder="1000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={createToken.isPending}
        >
          {createToken.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Token
        </Button>
      </form>
    </Form>
  );
}
