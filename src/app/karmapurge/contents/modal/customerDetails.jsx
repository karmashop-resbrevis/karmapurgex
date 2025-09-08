import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function CustomerInfoModal({ isOpen, onClose, onSubmit }) {
	const [username, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [key, setKey] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ username, email, key });
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="modal"
					className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						className="bg-[#0a0a0a] ring-1 ring-white rounded-2xl shadow-xl p-6 w-full max-w-md text-white"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<div className="flex justify-between items-start text-left mb-5">
							<div className="flex flex-col">
								<h2 className="text-xl font-bold mb-2">Buyer Info</h2>
								<p className="text-sm text-white/70">
									If you already have an account, you can enter it here and the
									subscription will be automatically added to your account. If
									you don’t have one, a new account will be created, the
									subscription will be linked to it, and you can log in using
									the provided credentials.
								</p>
							</div>
							<button type="button" onClick={onClose} className="mb-10">
								<FaTimes className="close-icon" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => setUserName(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
							/>
							<input
								type="email"
								placeholder="Email Address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
							/>
							<input
								type="password"
								placeholder="Account Key"
								value={key}
								onChange={(e) => setKey(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
								autoComplete="off"
							/>
							<div className="flex justify-end gap-2">
								<button type="submit" className={`tombol hover:ring-green-600`}>
									Continue
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
