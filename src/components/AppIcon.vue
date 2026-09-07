<script setup>
import { Home, Map, ScanLine, UserRound, ChevronRight, ChevronLeft, ArrowUpRight, ArrowRight, Sparkles, ShieldCheck, Gift, BookOpen, Palette, Trophy, Bell, Volume2, VolumeX, MapPin, Clock3, Footprints, Bike, Zap, Compass, Landmark, Coffee, ScanFace, Building2, Check, X, Navigation, LocateFixed, Plus, Minus, LockKeyhole, Download, RefreshCw, Star, Ticket, Backpack, MessageCircle, Settings2, Play, CircleHelp, ExternalLink, Headphones, CheckCheck, Menu, Heart, Send, Route } from 'lucide-vue-next'
defineProps({ name: {type:String,default:'Sparkles'}, size:{type:[Number,String],default:20} })
const icons={Home,Map,ScanLine,UserRound,ChevronRight,ChevronLeft,ArrowUpRight,ArrowRight,Sparkles,ShieldCheck,Gift,BookOpen,Palette,Trophy,Bell,Volume2,VolumeX,MapPin,Clock3,Footprints,Bike,Zap,Compass,Landmark,Coffee,ScanFace,Building2,Check,X,Navigation,LocateFixed,Plus,Minus,LockKeyhole,Download,RefreshCw,Star,Ticket,Backpack,MessageCircle,Settings2,Play,CircleHelp,ExternalLink,Headphones,CheckCheck,Menu,Heart,Send,Route}
</script>
<template><component :is="icons[name] || Sparkles" :size="size" :stroke-width="1.8" aria-hidden="true" /></template>
