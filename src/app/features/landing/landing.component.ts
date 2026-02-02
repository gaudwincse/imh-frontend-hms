import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Heart, Activity, Shield, Users, ArrowRight, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Menu, X, CheckCircle } from 'lucide-angular';
import { LoaderService } from '../../core/services/loader.service';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
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

    isMobileMenuOpen = false;
    isScrolled = false;

    services = [
        {
            title: 'Cardiology',
            description: 'Expert care for your heart with advanced diagnostic and treatment options.',
            icon: Activity
        },
        {
            title: 'Emergency Care',
            description: '24/7 emergency services with a rapid response team and modern facilities.',
            icon: Shield
        },
        {
            title: 'General Surgery',
            description: 'Advanced surgical procedures performed by world-class specialists.',
            icon: Heart
        },
        {
            title: 'Pediatrics',
            description: 'Gentle and comprehensive healthcare for your children from birth to adolescence.',
            icon: Users
        }
    ];

    constructor(private loaderService: LoaderService) { }

    ngOnInit(): void {
        // Simulate initial loading
        this.loaderService.show();
        setTimeout(() => {
            this.loaderService.hide();
        }, 1500);

        window.addEventListener('scroll', () => {
            this.isScrolled = window.scrollY > 50;
        });
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}
