import subscriptionRouter from '../models/subscription.model.js';
import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';


export const getSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find().select('name user status startDate');

        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        next(error);
    }
}

export const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: subscription,
        });

    } catch (error) {
        next(error);
    }
}

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await subscriptionRouter.create({
            ...req.body, 
            user: req.user._id,
        })

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body:{
                subscriptionId: subscription.id,
            },
            headers: {
                'Content-Type': 'application/json',
            },
            retries: 0
        })

        res.status(201).json({
            success: true,
            data: { subscription, workflowRunId },
        });
    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Check if the user is the same as the one in the token
        if( req.user.id !== req.params.id ) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({
            success: true,
            data: subscriptions,
        });

    } catch (error) {
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.status === 'cancelled') {
            const error = new Error('Subscription already cancelled');
            error.statusCode = 409;
            throw error;
        }

        subscription.status = 'cancelled';
        subscription.renewalDate = null;

        await subscription.save();

        res.status(200).json({
            success: true,
            data: subscription,
        });

    } catch (error) {
        next(error);
    }
}