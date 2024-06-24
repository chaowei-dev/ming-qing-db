import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const isAuthenticated = passport.authenticate('jwt', { session: false });