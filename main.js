import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import User from '../../../models/User';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        const user = await User.findOne({ email: credentials.username });
        if (!user) {
          throw new Error('Invalid username or password');
        }
        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid username or password');
        }
        return user;
      }
    })
  ],

  // Configure session management
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  // Configure callbacks
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      // Add custom claims to the JWT token
      return {
        sub: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      };
    },
    async session(session, token, user) {
      // Add custom session data
      session.user = user;
      return session;
    }
  }
});
