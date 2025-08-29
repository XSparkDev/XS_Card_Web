import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../UI/dialog";
import { Button } from "../UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import { Badge } from "../UI/badge";
import { FaCheck, FaTimes } from "react-icons/fa";
import { rolesService, Role } from "../../services/rolesService";

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ isOpen, onClose }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rolesService.getRoles();
      setRoles(data.roles);
    } catch (err) {
      setError("Failed to load roles. Please try again.");
      console.error("Error loading roles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const permissionLabels = {
    viewCards: "View Cards",
    createCards: "Create Cards",
    editCards: "Edit Cards",
    deleteCards: "Delete Cards",
    manageUsers: "Manage Users",
    viewReports: "View Reports",
    systemSettings: "System Settings",
    auditLogs: "Audit Logs",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            View permissions for each role in the system. Contact your administrator to modify role permissions.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-600">
            Loading roles...
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {role.userCount} Users
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${
                          role.permissions[key as keyof typeof role.permissions] 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {role.permissions[key as keyof typeof role.permissions] ? (
                            <FaCheck className="w-3 h-3" />
                          ) : (
                            <FaTimes className="w-3 h-3" />
                          )}
                        </div>
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-6 gap-3">
          {!isLoading && roles.length > 0 && (
            <Button variant="outline" onClick={loadRoles}>
              Refresh
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageRolesModal; 