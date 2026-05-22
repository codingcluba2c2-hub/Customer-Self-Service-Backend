import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import { generateEmployeeId } from '../../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    if (!tenantId) {
      // If user has no tenant, fallback to orgName matching for backward compatibility
      const users = await User.find({ orgName: req.user.orgName }).select('-password');
      return res.json({ success: true, data: users });
    }

    const { page = 1, limit = 10, search, role, status, departmentId } = req.query;
    const query = { tenantId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const user = await User.findOne({ _id: req.params.id, tenantId }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { tenantId, orgName } = req.user;
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    let companyNameForPassword = 'Converiqo';

    // Check License Limits if tenant exists
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (tenant) {
        companyNameForPassword = tenant.companyName.replace(/\s+/g, '');
        const userCount = await User.countDocuments({ tenantId });
        if (userCount >= tenant.licenseLimit) {
          return res.status(403).json({ success: false, message: 'License limit exceeded. Please upgrade your plan to add more users.' });
        }
      }
    } else if (orgName) {
      companyNameForPassword = orgName.replace(/\s+/g, '');
    }

    const tempPassword = `${companyNameForPassword}@123`;

    const userData = {
      ...req.body,
      tenantId: tenantId || null,
      orgName: orgName || req.body.orgName,
      employeeId: req.body.employeeId || generateEmployeeId(),
      createdBy: req.user._id,
      password: tempPassword,
      temporaryPasswordGenerated: true,
      mustChangePassword: true,
      inviteStatus: 'Active'
    };

    const user = await User.create(userData);
    
    const savedUser = await User.findById(user._id).select('-password');
    res.status(201).json({ 
      success: true, 
      data: savedUser,
      tempPassword // Sending back the plain text temporary password to display to Admin once
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    // Prevent password updates via this endpoint
    delete updateData.password;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, tenantId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own account' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { $set: { status: 'Suspended', isActive: false, updatedBy: req.user._id } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { $set: { status: 'Active', isActive: true, updatedBy: req.user._id } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const query = { tenantId };

    const totalUsers = await User.countDocuments(query);
    const activeUsers = await User.countDocuments({ ...query, status: 'Active' });
    const suspendedUsers = await User.countDocuments({ ...query, status: 'Suspended' });
    const pendingInvites = await User.countDocuments({ ...query, inviteStatus: 'Pending' });
    const mfaEnabledUsers = await User.countDocuments({ ...query, mfaEnabled: true });

    let licenseLimit = 100; // Default
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (tenant) licenseLimit = tenant.licenseLimit;
    }

    const availableLicenses = Math.max(0, licenseLimit - totalUsers);
    const mfaAdoption = totalUsers > 0 ? Math.round((mfaEnabledUsers / totalUsers) * 100) : 0;

    // Active in last 24h
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const last24hActive = await User.countDocuments({ ...query, lastLogin: { $gte: yesterday } });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        pendingInvites,
        availableLicenses,
        licenseLimit,
        mfaAdoption,
        last24hActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
