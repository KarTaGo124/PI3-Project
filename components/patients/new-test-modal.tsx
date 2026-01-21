'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface NewTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    patientId: number;
}

export function NewTestModal({
    isOpen,
    onClose,
    onSuccess,
    patientId,
}: NewTestModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        test_date: new Date().toISOString().split('T')[0],
        lead_level: '',
        cadmium_level: '',
        arsenic_level: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    test_date: formData.test_date,
                    lead_level: parseFloat(formData.lead_level) || 0,
                    cadmium_level: parseFloat(formData.cadmium_level) || 0,
                    arsenic_level: parseFloat(formData.arsenic_level) || 0,
                    notes: formData.notes,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al guardar el test');
            }

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                test_date: new Date().toISOString().split('T')[0],
                lead_level: '',
                cadmium_level: '',
                arsenic_level: '',
                notes: '',
            });
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Error al guardar el test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Test</DialogTitle>
                    <DialogDescription>
                        Ingresa los resultados del análisis de metales pesados.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Fecha
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                className="col-span-3"
                                value={formData.test_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, test_date: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lead" className="text-right">
                                Plomo (µg/dL)
                            </Label>
                            <Input
                                id="lead"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="0.00"
                                value={formData.lead_level}
                                onChange={(e) =>
                                    setFormData({ ...formData, lead_level: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cadmium" className="text-right">
                                Cadmio (µg/L)
                            </Label>
                            <Input
                                id="cadmium"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="0.00"
                                value={formData.cadmium_level}
                                onChange={(e) =>
                                    setFormData({ ...formData, cadmium_level: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="arsenic" className="text-right">
                                Arsénico (µg/L)
                            </Label>
                            <Input
                                id="arsenic"
                                type="number"
                                step="0.01"
                                className="col-span-3"
                                placeholder="0.00"
                                value={formData.arsenic_level}
                                onChange={(e) =>
                                    setFormData({ ...formData, arsenic_level: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">
                                Notas
                            </Label>
                            <Textarea
                                id="notes"
                                className="col-span-3"
                                placeholder="Observaciones adicionales..."
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Test
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
