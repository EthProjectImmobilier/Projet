import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  CreditCard,
  Search,
  Building,
  HelpCircle,
  Users,
  Smartphone,
  Mail
} from 'lucide-react';

export const FAQPage = () => {
  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: HelpCircle,
      color: 'bg-blue-500',
      questions: [
        {
          id: 'what-is-rentchain',
          question: 'What is RentChain?',
          answer: 'RentChain is a blockchain-powered rental platform that connects property owners directly with tenants. Using smart contracts and cryptocurrency payments, we eliminate intermediaries, reduce fees, and provide secure, transparent transactions for everyone involved.'
        },
        {
          id: 'how-does-it-work',
          question: 'How does RentChain work?',
          answer: 'Property owners list their properties with detailed information and availability. Tenants can search, book, and pay securely using cryptocurrency. Smart contracts hold funds in escrow until the rental period is complete, ensuring both parties are protected.'
        },
        {
          id: 'blockchain-benefits',
          question: 'What are the benefits of blockchain technology?',
          answer: 'Blockchain provides immutable transaction records, eliminates the need for intermediaries, reduces transaction fees, enables instant global payments, and ensures complete transparency and security for all rental agreements.'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Trust',
      icon: Shield,
      color: 'bg-green-500',
      questions: [
        {
          id: 'funds-safe',
          question: 'Are my funds safe?',
          answer: 'Yes, all funds are held in smart contract escrow on the blockchain. Neither party can access the funds until the rental agreement conditions are met. This protects both owners and tenants from fraud.'
        },
        {
          id: 'identity-verification',
          question: 'Do you verify identities?',
          answer: 'Property owners undergo identity verification and background checks. While tenant verification is optional, we recommend it for added security. All transactions are recorded on the blockchain for complete transparency.'
        },
        {
          id: 'dispute-resolution',
          question: 'What happens in case of disputes?',
          answer: 'Our smart contracts include dispute resolution mechanisms. In case of disagreements, funds can be held until both parties agree on a resolution, or released according to the contract terms. We also provide mediation services.'
        },
        {
          id: 'data-privacy',
          question: 'How do you protect my privacy?',
          answer: 'We follow strict privacy policies and only collect necessary information. Personal data is encrypted and stored securely. Blockchain transactions are pseudonymous, protecting your financial privacy.'
        }
      ]
    },
    {
      id: 'renting',
      title: 'Renting Properties',
      icon: Search,
      color: 'bg-purple-500',
      questions: [
        {
          id: 'how-to-rent',
          question: 'How do I rent a property?',
          answer: 'Browse available properties using our search filters, select your dates, and make a booking request. Once approved, complete the payment through our secure blockchain system. The smart contract will hold your funds until check-in.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept various cryptocurrencies including Ethereum, USDC, and other stablecoins. This enables instant, low-fee international payments without currency conversion issues.'
        },
        {
          id: 'booking-cancellation',
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by property owner. Most offer flexible cancellation up to 24-48 hours before check-in. Refunds are processed automatically through the smart contract once the policy conditions are met.'
        },
        {
          id: 'check-in-process',
          question: 'How does check-in work?',
          answer: 'Upon successful payment, you\'ll receive digital access credentials (smart lock codes, keys, etc.) through our secure messaging system. The smart contract automatically releases funds to the owner once you confirm successful check-in.'
        }
      ]
    },
    {
      id: 'listing',
      title: 'Listing Properties',
      icon: Building,
      color: 'bg-orange-500',
      questions: [
        {
          id: 'how-to-list',
          question: 'How do I list my property?',
          answer: 'Create an owner account, verify your identity, and add your property details including photos, amenities, pricing, and availability calendar. Our AI-powered tools help optimize your listing for better visibility.'
        },
        {
          id: 'listing-fees',
          question: 'What are the fees for listing?',
          answer: 'RentChain charges no listing fees or commissions. You only pay a small blockchain network fee for transactions. This means you keep more of your rental income compared to traditional platforms.'
        },
        {
          id: 'pricing-tips',
          question: 'How should I price my property?',
          answer: 'Use our AI market analysis tools to see comparable properties and current demand. We provide pricing recommendations based on location, amenities, and seasonal trends to help you maximize your income.'
        },
        {
          id: 'booking-management',
          question: 'How do I manage bookings?',
          answer: 'Receive booking requests through your dashboard, approve or decline them, and communicate with tenants. The smart contract handles payments automatically, and you receive funds immediately upon successful check-in.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Escrow',
      icon: CreditCard,
      color: 'bg-indigo-500',
      questions: [
        {
          id: 'escrow-works',
          question: 'How does escrow work?',
          answer: 'When a booking is confirmed, tenant funds are locked in a smart contract. The funds remain inaccessible until the rental period completes successfully. This protects both parties from default or fraud.'
        },
        {
          id: 'funds-released',
          question: 'When are funds released?',
          answer: 'Funds are automatically released to the property owner upon tenant check-in confirmation. If issues arise during the stay, the smart contract can hold funds until resolution or release them according to the agreed terms.'
        },
        {
          id: 'crypto-wallet',
          question: 'Do I need a crypto wallet?',
          answer: 'Yes, you\'ll need a cryptocurrency wallet to send and receive payments. We support popular wallets like MetaMask, WalletConnect, and Coinbase Wallet. We also provide guidance for setting up your first wallet.'
        },
        {
          id: 'transaction-fees',
          question: 'What are the transaction fees?',
          answer: 'Transaction fees are minimal and only cover blockchain network costs (typically 0.5-2% of the transaction value). There are no platform fees, commissions, or hidden charges.'
        }
      ]
    },
    {
      id: 'support',
      title: 'Account & Support',
      icon: Users,
      color: 'bg-red-500',
      questions: [
        {
          id: 'account-types',
          question: 'What account types are available?',
          answer: 'We offer separate accounts for tenants and property owners. Owner accounts require identity verification for security. Both account types give you access to our full platform features.'
        },
        {
          id: 'technical-requirements',
          question: 'What are the technical requirements?',
          answer: 'You need a modern web browser and a cryptocurrency wallet. Mobile apps are available for iOS and Android. No special hardware is required beyond a smartphone or computer.'
        },
        {
          id: 'customer-support',
          question: 'How can I get help?',
          answer: 'Our support team is available 24/7 through email, live chat, and our comprehensive help center. For urgent issues, you can also contact us directly. Blockchain transactions are irreversible, so we recommend careful review before confirming.'
        },
        {
          id: 'account-security',
          question: 'How do I secure my account?',
          answer: 'Enable two-factor authentication, use a strong password, and keep your wallet recovery phrases secure. Never share your private keys or wallet credentials. We recommend using hardware wallets for large amounts.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Everything you need to know about RentChain, from getting started to advanced features.
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category) => (
            <Card key={category.id} className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${category.color} text-white shadow-lg`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Common questions about {category.title.toLowerCase()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border-b border-border/50">
                      <AccordionTrigger className="text-left hover:no-underline py-6 px-4 rounded-lg hover:bg-muted/30 transition-colors">
                        <span className="font-semibold text-lg">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-6">
                        <div className="text-muted-foreground leading-relaxed text-base pl-4 border-l-2 border-primary/20">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our support team is here to help. Get in touch with us and we'll respond as quickly as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  support@rentchain.com
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Smartphone className="w-4 h-4 mr-2" />
                  24/7 Live Chat
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
