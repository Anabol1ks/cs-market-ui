'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserCircle2,
  Package,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import Cookies from "js-cookie";
import { set } from 'date-fns'

// Временные данные для примера
const mockUser = {
  id: '1',
  name: 'User123',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
  balance: 1250.50,
  totalTrades: 45,
  inventoryValue: 3780.25,
  steamLevel: 32,
};

const mockInventory = Array.from({ length: 6 }, (_, i) => ({
  id: `item-${i}`,
  name: `AK-47 | Азимов`,
  wear: 'Прямо с завода',
  price: 234.50 + i * 10,
  image: 'https://images.unsplash.com/photo-1608346128025-1896b97a6fa7?w=400',
}));

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('inventory');
	const [steamInventory, setSteamInventory] = useState([])

  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
		async function fecthUsers() {
			setLoading(true)
			try {
				const token = Cookies.get('access_token')
				if (!token) {
					throw new Error('Токен не найден в cookie')
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/profile`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					}
				)

				if (!response.ok) {
					throw new Error(`Ошибка запроса: ${response.status}`)
				}
				const users = await response.json()
				setUser(users)
			} catch (error) {
			} finally {
				setLoading(false)
			}
			setLoading(false)
		}
		fecthUsers()
	}, [])

	useEffect(() => {
		async function fetchSteamInventory() {
			setLoading(true)
			try {
				const token = Cookies.get('access_token')
				if (!token) {
					throw new Error('Токен не найден в cookie')
				}

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/profile/inventory`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					}
				)

				if (!response.ok) {
					throw new Error(`Ошибка запроса: ${response.status}`)
				}

				const steamInv = await response.json()
				console.log('API Response:', steamInv)

				// Проверяем, что данные пришли
				if (!steamInv.inventory || !Array.isArray(steamInv.inventory)) {
					throw new Error(`Некорректный ответ API: ${JSON.stringify(steamInv)}`)
				}

				// Фильтруем предметы, которые можно продать или обменять
				const marketableItems = steamInv.inventory.filter(
					item => item.marketable === 1 && item.tradable === 1
				)

				// Обрабатываем и выводим результат
				const mergedInventory = marketableItems.map(item => ({
					classid: item.classid,
					market_name: item.market_name,
					icon_url: item.icon_url,
					price: item.price, // Убедитесь, что это поле всегда есть, иначе можно обработать условие
				}))

				console.log('Processed Inventory:', mergedInventory)
				setSteamInventory(mergedInventory)
			} catch (error) {
				console.error('Ошибка загрузки инвентаря:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchSteamInventory()
	}, [])



  return (
		<div className='space-y-6'>
			{/* Профиль */}
			<Card className='p-6'>
				<div className='flex flex-col md:flex-row gap-6 items-center md:items-start'>
					<div className='relative w-32 h-32 rounded-full overflow-hidden'>
						<Image
							src={user.AvatarURL}
							alt='Аватар'
							fill
							className='object-cover'
						/>
					</div>

					<div className='flex-1 space-y-4 text-center md:text-left'>
						<div>
							<h1 className='text-2xl font-bold'>{user.Username}</h1>
							<p className='text-muted-foreground'>
								Steam Level: {mockUser.steamLevel}
							</p>
						</div>

						<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
							<div>
								<div className='text-lg font-bold'>
									${mockUser.balance.toFixed(2)}
								</div>
								<div className='text-sm text-muted-foreground'>Баланс</div>
							</div>
							<div>
								<div className='text-lg font-bold'>{mockUser.totalTrades}</div>
								<div className='text-sm text-muted-foreground'>Сделок</div>
							</div>
							<div>
								<div className='text-lg font-bold'>
									${mockUser.inventoryValue.toFixed(2)}
								</div>
								<div className='text-sm text-muted-foreground'>
									Стоимость инвентаря
								</div>
							</div>
						</div>
					</div>

					<div className='flex md:flex-col gap-2'>
						<Button variant='outline' size='icon'>
							<Settings className='h-4 w-4' />
						</Button>
						<Button variant='outline' size='icon' className='text-destructive'>
							<LogOut className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</Card>

			{/* Вкладки */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className='grid grid-cols-4 w-full md:w-[550px]'>
					<TabsTrigger value='inventory'>Инвентарь</TabsTrigger>
					<TabsTrigger value='inventorySteam'>Инвентарь Стим</TabsTrigger>
					<TabsTrigger value='trades'>История</TabsTrigger>
					<TabsTrigger value='settings'>Настройки</TabsTrigger>
				</TabsList>

				<TabsContent value='inventory' className='mt-6'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{mockInventory.map(item => (
							<Card key={item.id} className='overflow-hidden'>
								<div className='relative aspect-[16/9]'>
									<Image
										src={item.image}
										alt={item.name}
										fill
										className='object-cover'
									/>
								</div>
								<div className='p-4'>
									<h3 className='font-semibold'>{item.name}</h3>
									<p className='text-sm text-muted-foreground'>{item.wear}</p>
									<p className='mt-2 font-bold'>${item.price.toFixed(2)}</p>
								</div>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value='inventorySteam' className='mt-6'>
					<div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4'>
						{steamInventory.length > 0 ? (
							steamInventory.map(item => (
								<Card
									key={item.assetid}
									className={`
            overflow-hidden rounded-lg group relative
            ${
							item.price < 10
								? 'bg-gray-900/90 grayscale'
								: 'bg-gray-800 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-200'
						}
          `}
								>
									<div className='relative w-full h-28 sm:h-32 md:h-36 bg-gray-900 flex items-center justify-center'>
										<Image
											src={item.icon_url}
											alt={item.market_name}
											fill
											className={`
                object-contain p-2
                ${
									item.price < 10
										? 'opacity-75'
										: 'hover:scale-110 transition-transform duration-200'
								}
              `}
										/>
									</div>
									<div
										className={`
            p-1.5 text-left text-sm font-medium
            ${item.price < 10 ? 'text-gray-500' : 'text-primary'}
          `}
									>
										{item.price + ' руб.'}
									</div>
									<div className='p-2 text-center'>
										<h3
											className={`
              text-xs sm:text-sm font-medium truncate px-1
              ${item.price < 10 ? 'text-gray-400' : 'text-gray-200'}
            `}
										>
											{item.market_name}
										</h3>
									</div>
									<div className='absolute invisible group-hover:visible bg-black/90 p-2 rounded-md text-xs text-white -bottom-full left-1/2 -translate-x-1/2 w-max max-w-[300px] z-50 whitespace-normal break-words'>
										{item.market_name}
									</div>
								</Card>
							))
						) : (
							<p className='text-center text-gray-400 py-8 text-lg'>
								Инвентарь пуст
							</p>
						)}
					</div>
				</TabsContent>

				<TabsContent value='trades' className='mt-6'>
					<Card className='p-6'>
						<h3 className='text-xl font-semibold mb-4'>История сделок</h3>
						<p className='text-muted-foreground'>История сделок пока пуста</p>
					</Card>
				</TabsContent>

				<TabsContent value='settings' className='mt-6'>
					<Card className='p-6'>
						<h3 className='text-xl font-semibold mb-4'>Настройки профиля</h3>
						<p className='text-muted-foreground'>
							Настройки профиля будут доступны позже
						</p>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}