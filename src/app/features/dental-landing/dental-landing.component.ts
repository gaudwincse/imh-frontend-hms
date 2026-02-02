import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Heart, Activity, Shield, Users, ArrowRight, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X, CheckCircle, Smile, ShieldCheck, Zap } from 'lucide-angular';
import { LoaderService } from '../../core/services/loader.service';

@Component({
    selector: 'app-dental-landing',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, RouterModule],
    templateUrl: './dental-landing.component.html',
    styleUrls: ['./dental-landing.component.scss']
})
export class DentalLandingComponent implements OnInit {
    // Icons
    readonly Heart = Heart;
    readonly Activity = Activity;
    readonly Shield = Shield;
    readonly Users = Users;
    readonly ArrowRight = ArrowRight;
    readonly Phone = Phone;
    readonly Mail = Mail;
    readonly MapPin = MapPin;
    readonly Facebook = Facebook;
    readonly Twitter = Twitter;
    readonly Instagram = Instagram;
    readonly Linkedin = Linkedin;
    readonly Menu = Menu;
    readonly X = X;
    readonly CheckCircle = CheckCircle;
    readonly Smile = Smile;
    readonly ShieldCheck = ShieldCheck;
    readonly Zap = Zap;

    isMobileMenuOpen = false;
    isScrolled = false;

    services = [
        {
            title: 'Orthodontics',
            description: 'Expert teeth straightening with modern braces and clear aligner solutions.',
            icon: Smile
        },
        {
            title: 'Emergency Dentistry',
            description: 'Immediate care for toothaches, broken teeth, and urgent dental issues.',
            icon: ShieldCheck
        },
        {
            title: 'Teeth Whitening',
            description: 'Professional brightening treatments for a radiant, confident smile.',
            icon: Zap
        },
        {
            title: 'Pediatric Dental',
            description: 'Gentle, friendly dental care tailored specifically for children.',
            icon: Users
        }
    ];

    constructor(private loaderService: LoaderService) { }

    ngOnInit(): void {
        window.addEventListener('scroll', () => {
            this.isScrolled = window.scrollY > 50;
        });
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}
