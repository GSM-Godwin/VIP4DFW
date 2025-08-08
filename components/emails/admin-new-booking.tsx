import * as React from 'react';
import { Html, Head, Body, Container, Text, Link, Hr, Heading, Section } from '@react-email/components';

interface AdminNewBookingEmailProps {
  bookingId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  adminDashboardUrl: string;
}

export function AdminNewBookingEmail({
  bookingId,
  pickupLocation,
  dropoffLocation,
  pickupTime,
  contactName,
  contactEmail,
  contactPhone,
  adminDashboardUrl,
}: AdminNewBookingEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New VIP4DFW Booking Alert!</Heading>
          <Text style={paragraph}>A new booking has been placed on VIP4DFW.</Text>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={heading}>Booking Details:</Text>
            <Text style={paragraph}><strong>Booking ID:</strong> {bookingId}</Text>
            <Text style={paragraph}><strong>Pickup:</strong> {pickupLocation}</Text>
            <Text style={paragraph}><strong>Drop-off:</strong> {dropoffLocation}</Text>
            <Text style={paragraph}><strong>Pickup Time:</strong> {pickupTime}</Text>
          </Section>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={heading}>Client Contact Info:</Text>
            <Text style={paragraph}><strong>Name:</strong> {contactName}</Text>
            <Text style={paragraph}><strong>Email:</strong> {contactEmail}</Text>
            <Text style={paragraph}><strong>Phone:</strong> {contactPhone}</Text>
          </Section>
          <Hr style={hr} />
          <Text style={paragraph}>
            Please review this booking and take action in the admin dashboard:
          </Text>
          <Link href={adminDashboardUrl} style={button}>
            Go to Admin Dashboard
          </Link>
          <Text style={paragraph}>
            Thank you,
            <br />
            The VIP4DFW Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#ff8c00',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const heading = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const button = {
  backgroundColor: '#ff8c00',
  borderRadius: '5px',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  margin: '20px auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const section = {
  padding: '0 30px',
};
